import React from "react";

import store from "../../../store/store";

import AvailUsers from "./availUsers/AvailUsers";
import SendMessageButton from "./sendMessage/sendMessageButton/SendMessageButton";
import SendMessageInputLeft from "./sendMessage/sendMessageInput/SendMessageInputLeft";
import SendMessageInputRight from "./sendMessage/sendMessageInput/SendMessageInputRight";
import SendMessageInputTop from "./sendMessage/sendMessageInput/SendMessageInputTop";
import SendMessageInputDown from "./sendMessage/sendMessageInput/SendMessageInputDown";


import './chat.scss';

export default class Chat extends React.Component {
    constructor(props) {
        super(props);

        this.server = store.getState().server.value;

        this.message = React.createRef();
        this.chat = React.createRef();

        this.loggedUsers = null;

        this.state = {
            showUsers: false,
            messages: [],
            isOpenChat: false
        }
    }

    componentDidMount() {
        setInterval(() => {
            this.getMessage();
        }, 300);
    }

    async sendMessageTo(message, messageTo) {
        return await this.server.sendMessageTo(message, messageTo);
    }

    async sendMessageAll(message) {
        return await this.server.sendMessageAll(message);
    }
    
    async getMessage() {
        const message = await this.server.getMessage();
        if(this.state.messages.length !== message.length) {
            return this.setState({ messages: message.reverse() });
        }
    }

    async getLoggedUsers() {
        return this.loggedUsers = await this.server.getLoggedUsers();
    }

    onFocus() {
        this.setState({ isOpenChat: true })
        return this.getLoggedUsers();
    }

    onBlur() {
        return this.setState({ isOpenChat: false });
    }

    //----------Послать сообщение
    sendMessage(e) {
        e.preventDefault()
        const text = this.message.current.value;
        this.message.current.value = '';
        if(text) {
            const messageAll = text.split('@');
            if(!messageAll[1]) {
                return this.sendMessageAll(messageAll[0]);
            }
            const messageArr = text.split(/[@\s]+/).slice(1);
            const messageTo = messageArr[0];
            const message = messageArr.slice(1).join(' ');
            return this.sendMessageTo(message, messageTo);
        }
    }

    //--------Показывает залогининых юзеров
    showAvailableUsers() {
        const text = this.message.current.value;
        if(text) {
            const message = text.split();
            if(message[0].includes('@') && message[0].split('@')[1] === '') {
                return this.setState({ showUsers: true });
            } else {
                return this.setState({ showUsers: false });
            }
        }
    }

    // Закрывает окошко залогиненых юзеров
    closeList(e) {
        if(e.keyCode === 8) {
            return this.setState({ showUsers: false });
        }
    }
    
    // Кладет выбранного юзера в инпут
    getUserToInput(name) {
        this.setState({ showUsers: false });
        this.message.current.value = '';
        this.message.current.focus();
        return this.message.current.value = '@' + name + ' ';
    }

    render() {
        return(
            <div className={`chat-box`}>
                <div className={`message-block ${ this.state.isOpenChat ? 'showChat' : 'hideChat' }`}>
                    {/* ------------------------------Уф.....Ну тут кароче чота происходит....... Вам не обязательно знать......---------------------------- */}
                    { 
                        this.state.showUsers ? 
                            <AvailUsers 
                                users={this.loggedUsers}
                                placeUser={(name) => this.getUserToInput(name)}
                            />
                        : ''
                    }
                    {
                        this.state.messages.map(message => {
                            return message.message_to !== '' ? 
                                <div
                                    className="personal-message-line" 
                                    key={message.id}
                                >
                                    <span className="message-sender">{message.name}: </span>
                                    <span className="message">{message.message}</span>    
                                </div>
                            : <div
                                className="message-line" 
                                key={message.id}
                                >
                                <span className="message-sender">{message.name}: </span>
                                <span className="message">{message.message}</span>    
                            </div>
                        })
                    }
                </div>
                <form className="send-message-block">
                    <SendMessageInputLeft/>
                    <SendMessageInputRight/>
                    <SendMessageInputDown/>
                    <SendMessageInputTop/>
                    <input 
                        className="message-input"
                        type={'text'} 
                        ref={this.message}
                        onFocus={() => this.onFocus()}
                        onBlur={() => this.onBlur()}
                        onInput={() => this.showAvailableUsers()}
                        onKeyDown={(e) => this.closeList(e)}
                    />
                    <button 
                        className="send-message-button"
                        type={'submit'}
                        onClick={(e) => this.sendMessage(e)}
                    >
                        <SendMessageButton/>
                    </button>
                </form>
            </div>
        );
    }
}