import React from 'react';
import { createRoot } from 'react-dom/client';
import { handleError, clearError, sendPost } from './helper';

/**
 * Sends a login request with user credentials
 * @param {SubmitEvent} e 
 * @returns 
 */
const handleLogin = (e) => {
    e.preventDefault();

    clearError();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;

    if (!username || !pass) {
        handleError("Username or password is empty!");
        return false;
    }

    // take url from the form's action attribute
    sendPost(e.target.action, { username, pass });
    return false;
}

/**
 * Sends an account creation request
 * @param {SubmitEvent} e 
 * @returns 
 */
const handleSignup = (e) => {
    e.preventDefault();
    clearError();

    const username = e.target.querySelector("#user").value;
    const pass = e.target.querySelector("#pass").value;
    const pass2 = e.target.querySelector("#pass2").value;

    if (!username || !pass || !pass2) {
        handleError("All fields are required");
        return false;
    }

    if (pass !== pass2) {
        handleError("Paswords do not match!");
        return false;
    }

    // take url from the form's action attribute
    sendPost(e.target.action, { username, pass, pass2 });

    return false;
}

const LoginWindow = (props) => {
    return (<div className='content-area'>
        <h1>Sign In</h1>
        <form id='login-form'
            name='loginForm'
            onSubmit={handleLogin}
            action='/login'
            method='POST'
            className='main-form'
        >
            <label htmlFor='username'>Username: </label>
            <input id='user' type='text' name='username' placeholder='username' />
            <label htmlFor='pass'>Password: </label>
            <input id='pass' type='password' name='pass' placeholder='password' />
            <input className='form-submit' type='submit' value='Sign In' />
        </form>
        <div id='login-errors' class='hidden'>
            <p><span class='error-message'></span></p>
        </div>
    </div>);
}

const SignupWindow = (props) => {
    return (<div className='content-area'>
        <h1>Sign In</h1>
        <form id='signup-form'
            name='signupForm'
            onSubmit={handleSignup}
            action='/signup'
            method='POST'
            className='main-form'
        >
            <label htmlFor='username'>Username: </label>
            <input id='user' type='text' name='username' placeholder='username' />
            <label htmlFor='pass'>Password: </label>
            <input id='pass' type='password' name='pass' placeholder='password' />
            <label htmlFor='pass2'>Password: </label>
            <input id='pass2' type='password' name='pass2' placeholder='retype password' />
            <input className='form-submit' type='submit' value='Sign Up' />
        </form>
        <div id='login-errors' class='hidden'>
            <p><span class='error-message'></span></p>
        </div>
    </div>);
}

const init = () => {
    const loginButton = document.querySelector("#login-btn");
    const signupButton = document.querySelector("#signup-btn");

    const root = createRoot(document.querySelector("#content"));

    loginButton.addEventListener('click', (e) => {
        e.preventDefault();
        root.render(<LoginWindow />);
        return false;
    });

    signupButton.addEventListener('click', (e) => {
        e.preventDefault();
        root.render(<SignupWindow />);
        return false;
    });

    root.render(<LoginWindow />);
};

window.onload = init;