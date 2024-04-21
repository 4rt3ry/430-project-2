import { sendGet } from './helper'
import React from 'react'
import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client'

const socket = io();

const personalChatId = await sendGet('/personalChatId');

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

/**
 * Display new message when socket.io receives 'chat message' event
 * @param {*} msg 
 */
const handleMessage = (msg) => {
    const newMessage = document.createElement("div");
    newMessage.innerHTML = `<p>${msg}</p>`;
    document.querySelector("#messages").appendChild(newMessage);
}

const connectUser = async (e) => {
    e.preventDefault();

    // ask the server to connect with another user's chat id
    const userChatId = e.target.querySelector("#connectUserInput");

    if (!userChatId.value || userChatId.value.length === 0) return false;

    // check with the server to see if chat id is valid
    const validId = await sendGet(`/checkUserChatId?chatId=${userChatId.value}`);
    
    if (!validId.message) return false;

    // id is valid, connect with the user
    socket.emit('room change', userChatId.value);
    document.querySelector("#messages").innerHTML = '';


    return false;
}

const Messages = (props) => {
    return (
        <div id='messages'></div>
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

const AppWindow = (props) => {
    return (<>
        <Channels></Channels>
        <Messages></Messages>
        <MessageForm></MessageForm>
    </>
    )
}

const init = () => {

    // connect to your own room by default
    socket.emit('room change', personalChatId.chatId);

    // I decided since messages are simply created
    // with no worry of deletion or anything, I'll just update 
    // them here instead of using react states
    socket.on('chat message', handleMessage);

    const root = createRoot(document.querySelector("#content"));
    root.render(<AppWindow></AppWindow>);
}

init();