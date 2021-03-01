import React, { useState, useEffect } from 'react';
import { Button, Col, Container, ListGroup, Modal, Row } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import socket from '../utils/socketio';
import { useHistory } from 'react-router-dom';
import mainIcon from '../assets/main-icon.svg';

function Game() {
    const { room, location, role, list, spy } = useLocation();
    let [timer, setTimer] = useState({min: 0, sec: 0});
    let [showRole, setShowRole] = useState(false);
    let [reveal, setReveal] = useState(false);
    let history = useHistory();

    useEffect(() => {
        //start timer
        socket.emit('start_timer');

        //update timer from server
        socket.on('timer_update', newTime => {
            setTimer(newTime);
        });

        //detect game ends
        socket.on('game_ended', () => {
            setReveal(true);
            // alert('the spy is ' + JSON.stringify(spy));
            // history.push({
            //     pathname: '/lobby',
            //     room,
            // });
        })
    }, [history, room, spy]);

    const handleClose = () => {

    }

    return (
        <Container className="pt-5 pb-5">
            <Row >
                <Col sm={6} className="mx-auto d-flex justify-content-center align-items-center mb-3">
                    <img className="logo-icon mr-3" src={mainIcon} alt="spyfall"/>
                    <h1 className="title-secondary text-shadow mb-0">SPYFALL</h1>
                </Col>
            </Row>
            <Row>
                <Col sm={6} className="mx-auto text-center">
                    <h2>{timer.min} : {timer.sec}</h2>
                </Col>
            </Row>
            <Row>
                <Col sm={6} className="mx-auto">
                    <div 
                    className="border border-primary border-1 rounded p-3 mt-2 mb-4"
                    onClick={() => setShowRole(r => !r)}>
                        <h5>Role: {!!showRole ? role : 'Tap to reveal'}</h5>
                        <h5>Location: {!!showRole ? (role === 'Spy' ? 'Unknown' : location) : 'Tap to reveal'}</h5>
                    </div>
                </Col>
            </Row>
            <Row>
                 <Col sm={6} className="mx-auto">
                     <h5>Locations</h5>
                 <ListGroup>
                     {
                        list.map(loc => (
                            <ListGroup.Item key={loc.name}>
                                {loc.name}
                            </ListGroup.Item>
                        ))
                    }
                </ListGroup>
                </Col>
            </Row>
            <Modal
                show={reveal}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                <Modal.Title>Game Over</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Spy reveal yourself
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary">Understood</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default Game;