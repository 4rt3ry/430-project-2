import { sendGet, sendPost } from './helper'
import React from 'react'
import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client'

const socket = io();

let personalChatId = (await sendGet('/personalChatId')).chatId;
const personalStaticChatId = (await sendGet('/personalChatId')).staticChatId;

const reloadChatId = async () => {
    personalChatId = (await sendGet('/personalChatId')).chatId;
    return personalChatId;
}

let currentRoom;

////////////// Replacement for connectUser() and createDMChannel()


const Message = (props) => {
    return (<div className='message'>
        <h3 className='message-author'>{props.author}</h3>
        <span className='message-date'>{new Date(props.createdDate).toLocaleDateString()}</span>
        <p className="message-content">{props.message}</p>
    </div>)
}

const Messages = (props) => {

    useEffect(() => {
        const messages = document.querySelectorAll(".message-content");
        if (messages) {
            const lastMessage = messages[messages.length - 1];
            lastMessage?.scrollIntoView();
        }
    }, [props.messages]);

    const messages = props.messages.map(m => (
        <Message {...m}></Message>
    ));

    if (messages.length === 0) {
        return (
            <div id='messages'>
                <div class='ghost center'>
                    <h1>No messages yet!</h1>
                    <span class='icon sparkles-icon'></span>
                </div>
            </div>
        )
    }

    return (<>
        {/* <div id='messages-title'>
            {props.room.name}
        </div> */}
        <div id='messages'>{messages}</div>
    </>
    );
}

const Invite = (props) => {
    const [inviting, setInvite] = useState(false);


    useEffect(() => {
        const inviteInput = document.querySelector("#invite-input");
        if (inviteInput) inviteInput.focus();
    }, [inviting]);

    //  toggle between invite button and invite input
    const initInvite = (isInviting) => (e) => {
        if (isInviting === undefined) setInvite(!inviting);
        else setInvite(isInviting);
    }

    // send invite to the server
    const sendInvite = async (e) => {
        e.preventDefault();
        const chatIdInput = e.target.querySelector('#invite-input').value;

        if (!chatIdInput || chatIdInput.length === 0) return false;

        // check with the server to see if chat id is valid
        const validId = await sendGet(`/checkUserChatId?chatId=${chatIdInput}`);
        if (!validId.message) return false;

        if (chatIdInput.trim() === personalChatId.trim()) {
            socket.emit('room change', { id: personalStaticChatId, name: chatIdInput });
        }

        else {

            // TODO: actually create this request
            const nextRoom = await sendPost(`/createAndGetRoom`, { chatId: chatIdInput });

            // reload all messages and room details
            props.reloadRoom(nextRoom);
            props.fetchRooms();

            socket.emit('room change', nextRoom.room);
        }

        return false;
    }

    // if inviting, switch UI to text input
    if (inviting) {
        return (
            <div id='invite'>
                <form
                    name='invite-form'
                    onSubmit={sendInvite}>
                    <input
                        id='invite-input'
                        type='text'
                        placeholder='user id'
                        onBlur={initInvite(false)}
                    ></input>
                </form>
            </div>
        )
    }

    // by default, have only a button
    return (
        <div id='invite'>
            <button id='invite-btn' onClick={initInvite(true)}>
                Create Direct Message
                <span class='icon plus-icon'></span>
            </button>
        </div>
    )
}

const Rooms = (props) => {

    const [rooms, setRooms] = useState([]);
    
    const fetchRooms = async () => {
        const newRooms = await sendGet('/getRooms');
        setRooms(newRooms.rooms);
    }

    useEffect(() => {
        sendGet('/getRooms', async (res) => {
            setRooms(res.rooms);
        });
    }, props.reloadedRoom ?? []);

    const selectRoom = async (e) => {

        const currentRoom = e.currentTarget;

        // clear previously selected rooms
        const roomList = document.querySelectorAll('#rooms .room-node');
        if (roomList) {
            roomList.forEach(r => {
                r.classList.remove('selected');
            });
        }
        const roomId = currentRoom.dataset.roomId;
        const messagesResponse = await sendGet(`/getMessages?roomId=${roomId}`);

        currentRoom.classList.add('selected');
        props.reloadRoom({
            room: {
                id: roomId,
            },
            messages: messagesResponse
        });
    }

    const roomNodes = rooms.map((room, i) => {
        return (
            <li
                data-room-id={room.id}
                onClick={selectRoom}
                className={
                    (room.id === props.room.id ?
                     'selected' :
                      '') + ' room-node'}
            >
                <p>{room.name}</p>
                <span class='remove'></span>
            </li>
        )
    });

    return (
        <div id='rooms'>
            <h1>Rooms</h1>
            <ul class='category-list'>{roomNodes}</ul>
            <Invite reloadRoom={props.reloadRoom} fetchRooms={fetchRooms}></Invite>
        </div>
    )
}

const AccountInfo = (props) => {
    const copyId = (e) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(e.target.innerText);
        }
        else {
            // fallback
            e.target.focus();
            e.target.select();
            document.execCommand('copy', undefined, e.target.innerText);
        }
    }

    return (
        <div id='account-info'>
            <div class='tooltip'>
                <p id='personal-chat-id' onClick={copyId}>{props.chatId}</p>
                <span class='tooltip-text-above'>Copy User ID</span>
            </div>
            <a
                id='settings-btn'
                href='/account/settings'
            >
                <img class='icon' src='/assets/img/settings.png'></img>
            </a>
        </div>
    )
}

const SideBar = (props) => {
    return (
        <div id='side-bar'>
            <Rooms {...props}></Rooms>
            <AccountInfo chatId={props.chatId}></AccountInfo>
        </div>
    )
}

const MessageForm = (props) => {

    /**
     * Send a message to the current channel
     * @param {*} e 
     * @returns 
     */
    const sendMessage = async (e) => {
        e.preventDefault();

        if (e.which == 13 && e.shiftKey) {
            return false;
        }

        const messageBox = e.target.querySelector('#message-input');

        if (!messageBox.value || messageBox.value.length === 0) return false;

        const newMessage = {
            author: props.chatId,
            authorId: personalStaticChatId,
            message: messageBox.value,
            roomId: currentRoom.id
        };

        const serverMessage = await sendPost('/createMessage', newMessage);

        // now send a message using sockets
        socket.emit('chat message', serverMessage);
        messageBox.value = '';

        return false;
    };

    return (
        <div id='message-form'>
            <form
                name='message-form'
                onSubmit={sendMessage}
            >
                <input
                    id='message-input'
                    className='message'
                    type='text'
                    placeholder='Send a message!'
                ></input>
                {/* <input
                    className='messageSubmit'
                    type='submit'
                    value='Send'
                ></input> */}
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
            <div>
                <p>
                    Open BM is an experimental application that uses AI to
                    occasionally manipulate user messages. For this reason,
                    it is recommended that the user does not send any private
                    or personal information. By clicking 'I Accept', the user
                    understands that Open BM is not responsible for any loss
                    or misuse of personal data.
                </p>
            </div>
            <button onClick={close}>I Agree</button>
        </div>
    );
}

const ChatIdPopup = (props) => {
    const close = async () => {
        if (props.close) props.close();

        // if user inputed a new id, send it to the server
        // TODO: validate new id (it's already done in server)
        // perhaps create an error popup if unsucessful
        const chatId = document.querySelector('#chat-id-input').value;
        const send = { acceptedChatId: true };
        if (chatId) send.chatId = chatId;
        const result = await sendPost('/account', send);

        // show any errors to user
        if (result.error) {
            document.querySelector("#errors>.error-message").innerHTML = result.error;
            return;
        }

        props.setChatId(chatId);
        await reloadChatId();
    }

    // TURN THIS INTO A FORM

    return (
        <div class='content'>
            <div>
                <h1>Select a Chat Id</h1>
                <input
                    id='chat-id-input'
                    type='text'
                    placeholder={props.account.chatId}
                    class='light-theme'
                ></input>
                <div id='errors' class='hidden'>
                    <p><span class='error-message'></span></p>
                </div>
            </div>
            <button onClick={close}>Accept</button>
        </div>
    );
}

const PopupWindow = (props) => {

    const [popups, setPopups] = useState(props.queue);
    const root = document.querySelector('#popup'); // surely there's a better way to do this

    const nextPopup = () => {
        if (popups.length > 0) {
            setPopups(popup => popup.slice(1));
            root.classList.add('hidden');
        }
    }
    if (popups.length > 0) {
        root.classList.remove('hidden');

        const popupComponent = popups[0][0];
        const popupProps = popups[0][1] ?? {};

        return popupComponent({ ...popupProps, close: nextPopup });
    }
    return (<></>);
}

const AppWindow = (props) => {
    const [chatId, setChatId] = useState(props.chatId);
    const [messages, setMessages] = useState([]);

    // TODO: room is refactored to 'accountID-otherAccountID'
    const [room, setRoom] = useState(props.currentRoom);
    const [reloadedRoom, setReloadedRoom] = useState(false);

    // every time room changes, reload messages and set current room
    const reloadRoom = (room) => {
        setRoom(room.room);
        setMessages(room.messages);
        setReloadedRoom(r => !r);
    }

    const addMessage = (newMsg) => {
        setMessages(m => [...m, newMsg])
    }

    // Hook 'room change' event only once when the app
    // is created
    useEffect(async () => {
        socket.on('room change', (room) => {
            currentRoom = room;
            setRoom(room);
        });

        socket.on('chat message', addMessage)

        // load messages from server when initializing app

        // TODO: actually create GET '/createAndGetMessages?chatId=1234' on server
        /**
         * {
         *      room: {id, name},
         *      messages: []
         * }
         */
        const roomRequest = await sendPost(`/createAndGetRoom`, { chatId });

        if (roomRequest.error) {
            console.log(roomRequest.error);
            return;
        }

        reloadRoom(roomRequest);

        // Create Popup Window

        // retrieve account information before continuing
        const accountRequest = sendGet('/account');

        accountRequest.then(account => {
            // Each item of popupQueue: [ReactComponent, props]
            const popupQueue = [];
            if (!account.acceptedTou) popupQueue.push([NoticePopup]);
            if (!account.acceptedChatId) popupQueue.push([
                ChatIdPopup,
                { account, setChatId, room, setRoom }
            ]);
            // if (!account.acceptedChatId) popupQueue.push(<NoticePopup />);

            const popupNotice = createRoot(document.querySelector('#popup'));
            popupNotice.render(<PopupWindow queue={popupQueue} />);
        });

    }, []);

    return (<>
        <SideBar room={room} chatId={chatId} reloadRoom={reloadRoom} reloadedRoom={reloadedRoom}></SideBar>
        <div id='current-room'>
            <Messages room={room} messages={messages}></Messages>
            <MessageForm chatId={chatId}></MessageForm>
        </div>
    </>
    )
}

const init = async () => {

    currentRoom = { id: personalStaticChatId, name: personalChatId };

    const root = createRoot(document.querySelector('#content'));
    root.render(<AppWindow chatId={personalChatId} currentRoom={currentRoom}></AppWindow>);

    // connect to your own room by default
    socket.emit('room change', { id: personalStaticChatId, name: personalChatId });
}

init();