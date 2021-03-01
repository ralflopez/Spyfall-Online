import React, { useState, useContext, useEffect } from 'react';
import socket from '../utils/socketio';
import { Alert, Button, Col, Container, Form, FormControl, FormGroup, FormLabel, Row } from 'react-bootstrap';
import { Redirect, useHistory } from 'react-router-dom';
import { User } from './c_user';
import mainIcon from '../assets/main-icon.svg';

function Outdoor() {
    const { username } = useContext(User);
    let history = useHistory();
    let [invalidCode, setInvalidCode] = useState(false);

    useEffect(() => {
        socket.on('room_created', room => {
            socket.emit('join_room', { username, room, isAdmin: true });
            socket.on('is_room', () => {
                history.push({
                    pathname: '/lobby',
                    room
                });
            });
        });
        return () => {
            socket.off('room_created');
        }
    }, [history, username]);

    const createRoomHandler = () => {
        socket.emit('create_room');
    }

    const joinRoomHandler = (e) => {
        e.preventDefault();
        const room = e.target.elements.room;
        const code = room.value.toUpperCase().trim();

        socket.emit('join_room', { username, room: code });
        socket.on('is_room', status => {
            if(status)
                history.push({
                    pathname: '/lobby',
                    room: code
                });
            else
                setInvalidCode(true);
        });
    }

    return !username ? <Redirect to="/"/> : (
        <Container
        className="pt-5">
            <Row >
                <Col sm={6} className="mx-auto d-flex justify-content-center align-items-center mb-3">
                    <img className="logo-icon mr-3" src={mainIcon} alt="spyfall"/>
                    <h1 className="title-secondary text-shadow">SPYFALL</h1>
                </Col>
            </Row>
            <Row>
                <Col className="mx-auto">
                {!!invalidCode ? <Alert variant="danger">Invalid Room Code</Alert> : null}
                </Col>
            </Row>
            <Row>
                <Col sm={6} className="mx-auto mt-3">
                    <Form onSubmit={joinRoomHandler}>
                        <FormGroup>
                            <FormLabel>Join Room</FormLabel>
                            <FormControl name="room" placeholder="Room code"/>
                        </FormGroup>
                        <div className="text-right">
                            <Button variant="outlined" onClick={createRoomHandler} className="mr-1">Create</Button>
                            <Button variant="primary" type="submit">Join</Button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}

export default Outdoor;