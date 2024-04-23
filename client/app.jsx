import { sendGet, sendPost } from './helper'
import React from 'react'
import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client'

const socket = io();

const personalChatId = await sendGet('/personalChatId');

/**
 * Display new message when socket.io receives 'chat message' event
 * @param {*} msg 
 */
const handleMessage = (msg) => {
    const newMessage = document.createElement("div");
    newMessage.innerHTML = `<p>${msg}</p>`;
    document.querySelector("#messages").appendChild(newMessage);
}

/**
 * Send a message to the current channel
 * @param {*} e 
 * @returns 
 */
const sendMessage = (e) => {
    e.preventDefault();

    const messageBox = e.target.querySelector('#messageInput');

    if (!messageBox.value || messageBox.value.length === 0) return false;

    // now send a message using sockets
    socket.emit('chat message', messageBox.value);
    messageBox.value = '';

    return false;
};

const connectUser = async (e) => {
    e.preventDefault();

    // ask the server to connect with another user's chat id
    const userChatId = e.target.querySelector("#connectUserInput");

    if (!userChatId.value || userChatId.value.length === 0) return false;

    // check with the server to see if chat id is valid
    const validId = await sendGet(`/checkUserChatId?chatId=${userChatId.value}`);

    if (!validId.message) return false;

    createDMChannel(userChatId.value);

    return false;
}

/**
 * Warning: This assumes the given roomId is valid and 
 * provides no checks.
 * @param {*} userId 
 */
const createDMChannel = (userId) => {
    if (userId.trim() === personalChatId.chatId.trim()) {
        socket.emit('room change', userId);
    }

    else {
        socket.emit('room change', [personalChatId.chatId, userId].sort().join('-'))
    }

    document.querySelector("#messages").innerHTML = '';

}

const Messages = (props) => {

    return (<>
        <div id='messagesTitle'>
            <h1>You are in a room with {props.messagesTitle}</h1>
        </div>
        <div id='messages'></div>
    </>
    );
}

const Channels = (props) => {
    return (
        <div>
            <div><p id="personalChatId">Your ID: {personalChatId.chatId}</p></div>
            <form
                name="connectUser"
                onSubmit={connectUser}
                id="connectUserForm"
            >
                <input
                    id='connectUserInput'
                    type='text'
                    placeholder='Type in a user ID!'
                ></input>
                <input
                    className='connectSubmit'
                    type='submit'
                    value='Send'
                ></input>
            </form>
        </div>
    )
}

const MessageForm = (props) => {
    return (
        <div id='messageForm'>
            <form
                name='messageForm'
                onSubmit={sendMessage}
            >
                <input
                    id='messageInput'
                    className='message'
                    type='text'
                    placeholder='Send a message!'
                ></input>
                <input
                    className='messageSubmit'
                    type='submit'
                    value='Send'
                ></input>
            </form>
        </div>
    );
}

const NoticePopup = (props) => {
    const close = () => {
        if (props.close) props.close();
        sendPost('/account', { acceptedTOU: true })
    }

    return (
        <div class='content'>
            <p>
                Open BM is an experimental application that uses AI to
                occasionally manipulate user messages. For this reason,
                it is recommended that the user does not send any private
                or personal information. By clicking "I Accept", the user
                understands that Open BM is not responsible for any loss of
                data or misuse of personal data.
            </p>
            <button onClick={close}>I Agree</button>
        </div>
    );
}

const ChatIdPopup = (props) => {
    const close = () => {
        if (props.close) props.close();

        // if user inputed a new id, send it to the server
        // TODO: validate new id (it's already done in server)
        // perhaps create an error popup if unsucessful
        const chatId = document.querySelector("#chatIdInput").value;
        const send = { acceptedChatId: true };
        if (chatId) send.chatId = chatId;
        sendPost('/account', send);
    }
    

    // TURN THIS INTO A FORM

    return (
        <div class='content'>
            <h1>Select a Username</h1>
            <input
                id='chatIdInput'
                type='text'
                placeholder={props.account.chatId}
            ></input>
            <p>New username must be between 6 and 30 characters</p>
            <button onClick={close}>Accept</button>
        </div>
    );
}

const PopupWindow = (props) => {

    // Figure out a way to allow users to create their own id within a popup
    // If a user already has an id, don't show that popup

    const [popups, setPopups] = useState(props.queue);
    const root = document.querySelector("#popup"); // surely there's a better way to do this

    const nextPopup = () => {
        if (popups.length > 0) {
            setPopups(popup => popup.slice(1));
            root.classList.add("hidden");
        }
    }
    if (popups.length > 0) {
        root.classList.remove("hidden");

        const popupComponent = popups[0][0];
        const popupProps = popups[0][1] ?? {};

        return popupComponent({ ...popupProps, close: nextPopup });
    }
    return (<></>);
}

const AppWindow = (props) => {

    const [messagesTitle, setMessagesTitle] = useState(personalChatId.chatId);


    // Hook 'room change' event only once when the app
    // is created
    useEffect(() => {
        socket.on('room change', (roomId) => {
            console.log('room change');
            setMessagesTitle(`${roomId}`);
        });
    }, []);


    return (<>
        <Channels></Channels>
        <Messages messagesTitle={messagesTitle}></Messages>
        <MessageForm></MessageForm>
    </>
    )
}

const init = async () => {

    // retrieve account information before continuing
    const account = await sendGet('/account');

    // Each item: [ReactComponent, props]
    const popupQueue = [];
    if (!account.acceptedTou) popupQueue.push([NoticePopup]);
    if (!account.acceptedChatId) popupQueue.push([ChatIdPopup, { account }]);
    // if (!account.acceptedChatId) popupQueue.push(<NoticePopup />);

    const root = createRoot(document.querySelector("#content"));
    root.render(<AppWindow></AppWindow>);

    const popupNotice = createRoot(document.querySelector("#popup"));
    popupNotice.render(<PopupWindow queue={popupQueue} />);

    // I decided since messages are simply created
    // with no worry of deletion or anything, I'll just update 
    // them here instead of using react states.
    // In the case this changes, it is probably better to 
    // move this to a react component.
    socket.on('chat message', handleMessage);

    // connect to your own room by default
    socket.emit('room change', personalChatId.chatId);
}

init();