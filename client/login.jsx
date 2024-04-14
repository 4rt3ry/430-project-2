import React from 'react';
import { createRoot } from 'react-dom/client';

const handleLogin = (e) => {
    e.preventDefault();

    // TODO
    // helper.hideError();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;

    if (!username || !pass) {
        helper.handleError("Username or password is empty!");
        return false;
    }

    // TODO
    // helper.sendPost(e.target.action, { username, pass });
    return false;
}

const handleSignup = (e) => {
    e.preventDefault();
    // TODO
    // helper.hideError();

    const username = e.target.querySelector("#user").value;
    const pass = e.target.querySelector("#pass").value;
    const pass2 = e.target.querySelector("#pass2").value;

    if (!username || !pass || !pass2) {
        // TODO
        // helper.handleError("All fields are required");
        return false;
    }

    if (pass !== pass2) {
        // TODO
        // helper.handleError("Paswords do not match!");
        return false;
    }

    // TODO
    // helper.sendPost(e.target.action, { username, pass, pass2 });

    return false;
}

const LoginWindow = (props) => {
    return (
        <form id='loginForm'
            name='loginForm'
            onSubmit={handleLogin}
            action='/login'
            method='POST'
            className='mainForm'
        >
            <label htmlFor='username'>Username: </label>
            <input id='user' type='text' name='username' placeholder='username' />
            <label htmlFor='pass'>Password: </label>
            <input id='pass' type='password' name='pass' placeholder='password' />
            <input className='formSubmit' type='submit' value='Sign In' />
        </form>
    );
}

const SignupWindow = (props) => {
    return (
        <form id='signupForm'
            name='signupForm'
            onSubmit={handleSignup}
            action='/signup'
            method='POST'
            className='mainForm'
        >
            <label htmlFor='username'>Username: </label>
            <input id='user' type='text' name='username' placeholder='username' />
            <label htmlFor='pass'>Password: </label>
            <input id='pass' type='password' name='pass' placeholder='password' />
            <label htmlFor='pass2'>Password: </label>
            <input id='pass2' type='password' name='pass2' placeholder='retype password' />
            <input className='formSubmit' type='submit' value='Sign Up' />
        </form>
    );
}

const init = () => {
    const loginButton = document.querySelector("#loginButton");
    const signupButton = document.querySelector("#signupButton");

    const root = createRoot(document.querySelector("#content"));

    loginButton.addEventListener('click', (e) => {
        e.preventDefault();
        root.render(<LoginWindow />);
        return false;
    });

    signupButton.addEventListener('click', (e) => {
        e.preventDefault();
        root.render(<SignupWindow/>);
        return false;
    });

    root.render(<LoginWindow/>);
};

window.onload = init;