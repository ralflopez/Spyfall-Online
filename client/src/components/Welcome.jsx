import React, { useState, useEffect, useContext, useRef } from 'react';
import socket from '../utils/socketio';
import { Alert, Button, Col, Container, Form, FormControl, FormGroup, Row } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { User } from './c_user';
import mainIcon from '../assets/main-icon.svg';
import { TweenMax, Power3 } from 'gsap';

function Welcome() {
    let { username, setUsername } = useContext(User);
    let [taken, setTaken] = useState(false);
    let history = useHistory();

    //ref
    let logo = useRef();
    let title = useRef();
    let input = useRef();
    let container = useRef();

    useEffect(() => {
        TweenMax.from(container, 2, {filter: 'invert(100%)', delay: 1, ease: Power3.easeOut });
        TweenMax.from(logo, 2, {y: 200, ease: Power3.easeOut, delay: 2});
        TweenMax.staggerFrom([title, input], 3, {delay: 3, ease: Power3.easeOut, y: 20, display: 'none'}, .5);
    }, []);

    const usernameHandler = (e) => {
        setUsername(e.target.value)
    }

    const checkUsername = (e) => {
        e.preventDefault();
        socket.emit('set_username', username);
        socket.on('set_username', bool => {
            setTaken(bool);
            if(!bool)
                history.push({
                    pathname: '/outdoor',
                });
        });
    }

    return (
        <Container
        fluid 
        className="pt-5 screen-container"
        ref={c => container = c}>
            <Row>
                <Col className="text-center">
                    <img 
                    className="welcome-icon mb-3" 
                    src={mainIcon} 
                    alt="logo"
                    ref={l => logo = l}/>
                </Col>
            </Row>
            <Row>
                <Col 
                sm={6}
                className="text-center mx-auto"
                ref={t => title = t}>
                    <h1 className="title text-shadow">SPYFALL</h1>
                </Col>
            </Row>
            <Row>
                <Col 
                sm={6} 
                className="mx-auto">
                { !!taken ? <Alert variant="danger">Username already taken</Alert> : null }
                    <Form
                    ref={i => input = i}
                    onSubmit={checkUsername}>
                        <FormGroup>
                            <FormControl className="mb-3 mt-2" placeholder="Username" value={username} onChange={usernameHandler}/>
                            <Button type="submit" className="float-right" variant="primary">Start</Button>
                        </FormGroup>
                    </Form>
                </Col>
            </Row> 
        </Container>
    );
}

export default Welcome;