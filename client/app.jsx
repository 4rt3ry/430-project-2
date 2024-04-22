import { sendGet } from './helper'
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
    if (userId === personalChatId) {
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

const PopupNotice = (props) => {

    const removeNotice = () => {
        document.querySelector("#popup").classList.add("hidden");
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
            <button onClick={removeNotice}>I Agree</button>
        </div>
    );
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

const init = () => {
    const root = createRoot(document.querySelector("#content"));
    root.render(<AppWindow></AppWindow>);

    const popupNotice = createRoot(document.querySelector("#popup"));
    popupNotice.render(<PopupNotice/>);

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