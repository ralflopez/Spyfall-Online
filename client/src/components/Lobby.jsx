import React, { useState, useEffect, useContext } from 'react';
import { Button, Col, Container, Dropdown, DropdownButton, Form, ListGroup, Row } from 'react-bootstrap';
import { useHistory, useLocation } from 'react-router-dom';
import socket from '../utils/socketio';
import { User } from './c_user';
import mainIcon from '../assets/main-icon.svg';

function Lobby() {
    const { room } = useLocation();
    const { username } = useContext(User);
    let history = useHistory();
    let [players, setPlayers] = useState([]);
    let [isAdmin, setIsAdmin] = useState(false);
    let [version, setVersion] = useState(1);
    let [time, setTime] = useState(8);
    let [spyCount, setSpyCount] = useState(1);

    useEffect(() => {
        console.log(2)
        //update player list
        socket.on('player_update', playerList => {
            setPlayers(playerList);
        });

        //kick listener
        socket.on('kicked', () => {
            socket.emit('exit_room');
            history.push({
                pathname: '/outdoor',
            });
            alert('you have been kicked');
        });

        //start game
        socket.on('game_started', gameInfo => {
            const { players, location, list } = gameInfo;
            let role = '', spy = [];
            players.forEach(player => {
                console.log(1);
                if(player.username === username)
                    role = player.role;
                if(player.role === 'Spy')
                    spy.push(player.username);
            });
            history.push({
                pathname: '/game',
                room,
                location,
                role,
                list,
                spy
            });
        });
        
        return () => {
            socket.off('player_update');
            socket.off('kicked');
            socket.off('game_started');
        }
    }, [history, room, username]);

    useEffect(() => {
        let res = players.find(p => p.isAdmin === true);
        if(!res) return;
        if(res.username === username)
            setIsAdmin(true);
        
        return () => setIsAdmin(false)
    }, [players, username]);

    const startGame = () => {
       socket.emit('start', { category: version, time: time*60000, spyCount });
    }

    const leaveGame = async () => {
        return new Promise((res) => {
            socket.emit('exit_room');
            res(true);
        })
        .then(() => setPlayers([]))
        .then(() => history.push('/outdoor'));
    }

    const versionHandler = (ver) => {
        setVersion(ver);
    }

    const timeHandler = (e) => {
        setTime(e.target.value);
    }

    const kickHandler = (id) => {
        console.log('react: '+ id);
        socket.emit('kick_player', id);
        console.log('k')
    }

    return (
        <Container
        className="pt-5">
            <Row >
                <Col sm={6} className="mx-auto d-flex justify-content-center align-items-center mb-3">
                    <img className="logo-icon mr-3" src={mainIcon} alt="spyfall"/>
                    <h1 className="title-secondary text-shadow">SPYFALL</h1>
                </Col>
            </Row>
            <Row>
                <Col sm={6} className="mx-auto text-center mb-3"><h6><span>Code: </span>{room}</h6></Col>
            </Row>
            <Row className="p-3">
                <Col sm={6} className="mx-auto border border-primary border-1 rounded p-3 mb-3">
                    <h5 className="mb-3">Game Settings</h5>
                    <DropdownButton variant="success" title={`Spyfall ${version}`} size="sm">
                        <Dropdown.Item onClick={() => versionHandler(1)}>Spyfall 1</Dropdown.Item>
                        <Dropdown.Item onClick={() => versionHandler(2)}>Spyfall 2</Dropdown.Item>
                    </DropdownButton>
                    <Form>
                        <Form.Group controlId="formBasicRange" className="mt-3">
                            <Form.Label>Time: {time} mins</Form.Label>
                            <Form.Control variant="danger" type="range" min="1" max="30" value={time} onChange={timeHandler}/>
                            <Form.Label className="d-block mt-3">Number of Spies</Form.Label>
                            {
                                [1, 2, 3].map(c => <Form.Check
                                    className="d-inline mr-3"
                                    key={c}
                                    type="radio"
                                    label={c}
                                    name="spycount"
                                    value={c}
                                    checked={spyCount === c}
                                    onChange={() => setSpyCount(c)}
                                    />)
                            }
                        </Form.Group>
                    </Form>
                </Col>
            </Row>
            <Row>
                <Col sm={6} className="mx-auto">
                    <h5>Players</h5>
                    <ListGroup>
                    {
                        players.map(p => (
                            <ListGroup.Item key={p.id} className="d-flex justify-content-between align-items-center">
                                {p.username}
                                {!!isAdmin && p.username !== username 
                                    ? (<Button onClick={() => 
                                        kickHandler(p.id)} 
                                        size="sm" 
                                        variant="danger">X</Button>) 
                                : null}
                            </ListGroup.Item>
                        ))
                    }
                    </ListGroup>
                </Col>
            </Row>
            <Row>
                <Col sm={6} className="mx-auto text-right mt-3">
                <Button 
                    variant="secondary" 
                    onClick={leaveGame}
                    className="mb-2"
                >Leave</Button>
                {!!isAdmin 
                    ?   <Button 
                        variant="primary" 
                        disabled={players.length > 1 ? false : true}
                        onClick={startGame}
                        className="ml-2 mb-2"
                        >Start</Button> : null
                }
                </Col>
            </Row>
        </Container>
    );
}

export default Lobby;