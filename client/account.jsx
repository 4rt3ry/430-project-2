import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { sendGet, sendPost } from './helper';


const account = await sendGet('/account');


/**
 * List all of the available settings
 * @param {*} props 
 * @returns 
 */
const SideBar = (props) => {

    // make it easy to modify list of settings
    const settings = [
        'account',
        'premium'
    ];

    // select first item when page is reloaded
    useEffect(() => {
        document.querySelector('#settings-list li').classList.add('selected');
    }, []);

    /**
     * Clear all selected settings, then select the current one.
     * @param {MouseEvent} e 
     */
    const select = (e) => {
        const nextTab = e.currentTarget.dataset.name;

        // clear selected items
        document.querySelectorAll('#settings-list li').forEach(item => {
            item.classList.remove('selected');
        });

        // select current item
        e.currentTarget.classList.add('selected');
        props.setCurrentTab(nextTab);
    }

    const settingsList = settings.map((s, i) => {
        return (
            <li
                onClick={select}
                data-name={s}
            >
                <p>{s}</p>
            </li>
        )
    });

    return (
        <div id='side-bar'>
            <ul id='settings-list'>
                {settingsList}
            </ul>
        </div>
    )
}

const UsernameForm = (props) => {

    /**
     * 
     * @param {SubmitEvent} e 
     */
    const changeUsername = async (e) => {
        e.preventDefault();

        const newUsername = e.currentTarget.querySelector("#username-input").value;
        const password = e.currentTarget.querySelector("#password-input").value;
        const result = await sendPost('/secureAccount', { newUsername, password });
        const errorText = document.querySelector("#login-errors>.error-message");
        if (result.error) {
            if (errorText) errorText.innerHTML = result.error;
        }
        else {
            if (errorText) errorText.innerHTML = "";
            window.location.reload();
        }
        return false;
    }

    return (<>
        <div class='close-popup' onClick={props.closeForm}></div>
        <div
            class='content'
        >
            <h1>Change Username</h1>
            <form id='change-username-form'
                name='change-username-form'
                onSubmit={changeUsername}
                className='account-form'
                method='POST'
            >
                <label htmlFor='username-input'>New Username</label>
                <input id='username-input' type='text' name='username-input' placeholder='new username' />
                <label htmlFor='password-input'>Current Password</label>
                <input id='password-input' type='password' name='password-input' placeholder='password' />
                <input className='form-submit' type='submit' value='Confirm' />
            </form>
            <div id='login-errors' class='hidden'>
                <p><span class='error-message'></span></p>
            </div>
        </div>
    </>);
}

const ChatIdForm = (props) => {
    /**
     * 
     * @param {SubmitEvent} e 
     */
    const changeChatId = async (e) => {
        e.preventDefault();

        const chatId = e.currentTarget.querySelector("#chat-id-input").value;
        const result = await sendPost('/account', { chatId });
        const errorText = document.querySelector("#login-errors>.error-message");
        if (result.error) {
            if (errorText) errorText.innerHTML = result.error;
        }
        else {
            if (errorText) errorText.innerHTML = "";
            window.location.reload();
        }
        return false;
    }

    return (<>
        <div class='close-popup' onClick={props.closeForm}></div>
        <div
            class='content'
        >
            <h1>Change Username</h1>
            <form id='change-username-form'
                name='change-username-form'
                onSubmit={changeChatId}
                className='account-form'
                method='POST'
            >
                <label htmlFor='chat-id-input'>New Chat ID</label>
                <input id='chat-id-input' type='text' name='chat-id-input' placeholder={account.chatId} />
                <input className='form-submit' type='submit' value='Confirm' />
            </form>
            <div id='login-errors' class='hidden'>
                <p><span class='error-message'></span></p>
            </div>
        </div>
    </>);
}

const PasswordForm = (props) => {

    /**
     * 
     * @param {SubmitEvent} e 
     */
    const changePassword = async (e) => {
        e.preventDefault();

        const password = e.currentTarget.querySelector("#password-input").value;
        const newPassword = e.currentTarget.querySelector("#new-password-input").value;
        const newPassword2 = e.currentTarget.querySelector("#new-password-2-input").value;
        const result = await sendPost('/secureAccount', { password, newPassword, newPassword2 });
        const errorText = document.querySelector("#login-errors>.error-message");
        if (result.error) {
            if (errorText) errorText.innerHTML = result.error;
        }
        else {
            if (errorText) errorText.innerHTML = "";
            window.location.reload();
        }
        return false;
    }

    return (<>
        <div class='close-popup' onClick={props.closeForm}></div>
        <div
            class='content'
        >
            <h1>Change Username</h1>
            <form id='change-password-form'
                name='change-password-form'
                onSubmit={changePassword}
                className='account-form'
                method='POST'
            >
                <label htmlFor='password-input'>Current Password</label>
                <input id='password-input' type='text' name='password-input' placeholder='new username' />
                <label htmlFor='new-password-input'>New Password</label>
                <input id='new-password-input' type='password' name='new-password-input' placeholder='password' />
                <label htmlFor='new-password-2-input'>Re-type Password</label>
                <input id='new-password-2-input' type='password' name='new-password-2-input' placeholder='re-type password' />
                <input className='form-submit' type='submit' value='Confirm' />
            </form>
            <div id='login-errors' class='hidden'>
                <p><span class='error-message'></span></p>
            </div>
        </div>
    </>);
}

/**
 * I want settings to be modular, so each 'tab' will have it's own ComponentSettings react component.
 * This one controlls username, password, and other settings related to user's account
 * @param {*} props 
 */
const AccountSettings = (props) => {

    const [formEnabled, setFormEnabled] = useState(false);

    const formPopup = document.querySelector('#account-form-popup');

    const closeFormKeyDown = (e) => {
        if (e.key === 'Escape') {
            closeForm();
        }
    }

    const closeForm = () => {
        if (formPopup) {
            formPopup.innerHTML = '';
            formPopup.classList.add('hidden');
            window.removeEventListener('keydown', closeFormKeyDown);
        }
        // setFormEnabled(false);
    }

    const openForm = (popup) => {
        if (formPopup) {
            const root = createRoot(formPopup);
            root.render(popup({ closeForm }));

            formPopup.classList.remove('hidden');
            window.addEventListener('keydown', closeFormKeyDown);
        }
    }

    return (
        <div
            id='account-settings'
            className='center'
        >
            <div className='settings-content'>
                <div id='account-display-container'>
                    <table id='account-display'>
                        <tbody>
                            <tr id='username-row'>
                                <td className='account-row-info'>
                                    <h3>Username</h3>
                                    <p>{account.username ?? ''}</p>
                                </td>
                                <td className='account-row-edit'>
                                    <button onClick={() => openForm(UsernameForm)}>Edit</button>
                                </td>
                            </tr>
                            <tr id='chat-id-row'>
                                <td className='chat-id-row-info'>
                                    <h3>Chat ID</h3>
                                    <p>{account.chatId ?? ''}</p>
                                </td>
                                <td className='account-row-edit'>
                                    <button onClick={() => openForm(ChatIdForm)}>Edit</button>
                                </td>
                            </tr>
                            <tr id='password-row'>
                                <td className='password-row-info'>
                                    <h3>Password</h3>
                                    <p>••••••••</p>
                                </td>
                                <td className='account-row-edit'>
                                    <button onClick={() => openForm(PasswordForm)}>Edit</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

const PremiumSettings = (props) => {

    console.log(account.premium);
    const [purchased, setPurchased] = useState(account.premium);
    console.log(purchased);

    const purchasePremium = async () => {
        sendPost('/purchasePremium');
        setPurchased(true);
    }

    const content = purchased || account.premium ?
        (
            <p>You are Premium!</p>
        ):
        (<>
            <p>Purchase Premium?</p>
            <button onClick={purchasePremium}>Yes</button>
        </>
        );

    return (
        <div id='premium-settings'>
            <div className='settings-content'>
                <div className="premium-display">
                    {content}
                </div>
            </div>
        </div>
    )
}

/**
 * Represents the right side of the settings window
 * @param {*} props 
 * @returns 
 */
const SettingsContent = (props) => {

    const settingsMap = {
        'account': AccountSettings,
        'premium': PremiumSettings
    }

    const currentSettings = settingsMap[props.currentTab];

    return (
        <div id='settings-container'>
            {currentSettings()}
        </div>
    );
}


const Main = (props) => {

    const [currentTab, setCurrentTab] = useState('account');

    return (<>
        <SideBar setCurrentTab={setCurrentTab}></SideBar>
        <SettingsContent currentTab={currentTab}></SettingsContent>
    </>)
}

const init = () => {

    const root = createRoot(document.querySelector('#content'));
    root.render(<Main></Main>);
}


init();