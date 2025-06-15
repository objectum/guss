import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Typography, Tag, Space, message, Spin, Row, Col } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { roundAPI, tapAPI } from '../services/api';
import type { Round as RoundType, TapResponse } from '../types';

const { Title, Text } = Typography;

const Round: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [round, setRound] = useState<RoundType | null>(null);
    const [loading, setLoading] = useState(true);
    const [tapping, setTapping] = useState(false);
    const [score, setScore] = useState<number>(0);
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [roundStatus, setRoundStatus] = useState<'Активен' | 'Cooldown' | 'Завершен'>('Завершен');

    useEffect(() => {
        if (id) {
            loadRound();
        }
    }, [id]);

    useEffect(() => {
        const timer = setInterval(() => {
            if (round) {
                updateTimeAndStatus();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [round]);

    const loadRound = async () => {
        try {
            setLoading(true);
            if (!id) return;
            const data = await roundAPI.getRound(id);
            setRound(data);
            updateTimeAndStatus(data);
            
            // Загружаем текущий счет пользователя
            try {
                const scoreData = await tapAPI.getScore(id);
                setScore(scoreData.score);
            } catch (scoreError) {
                // Если ошибка получения счета, оставляем 0
                setScore(0);
            }
        } catch (error: any) {
            message.error(
                'Ошибка загрузки раунда: ' + (error.response?.data?.message || error.message)
            );
        } finally {
            setLoading(false);
        }
    };

    const updateTimeAndStatus = (currentRound?: RoundType) => {
        const roundData = currentRound || round;
        if (!roundData) return;

        const now = new Date().getTime();
        const startTime = new Date(roundData.startTime).getTime();
        const endTime = new Date(roundData.endTime).getTime();

        let status: 'Активен' | 'Cooldown' | 'Завершен';
        let timeString = '';

        if (now < startTime) {
            status = 'Cooldown';
            const diff = startTime - now;
            timeString = formatTime(diff);
        } else if (now >= startTime && now <= endTime) {
            status = 'Активен';
            const diff = endTime - now;
            timeString = formatTime(diff);
        } else {
            status = 'Завершен';
            timeString = '00:00';
        }

        setRoundStatus(status);
        setTimeLeft(timeString);
    };

    const formatTime = (milliseconds: number): string => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleTap = async () => {
        if (!id || roundStatus !== 'Активен' || tapping) return;

        try {
            setTapping(true);
            const response: TapResponse = await tapAPI.tap({ round_id: parseInt(id) });
            setScore(response.score);
            message.success(`+1 тап! Очки: ${response.score}`);
        } catch (error: any) {
            message.error(
                'Ошибка тапа: ' + (error.response?.data?.message || error.message)
            );
        } finally {
            setTapping(false);
        }
    };

    const getStatusColor = (status: 'Активен' | 'Cooldown' | 'Завершен') => {
        switch (status) {
            case 'Активен':
                return 'green';
            case 'Cooldown':
                return 'orange';
            case 'Завершен':
                return 'red';
            default:
                return 'default';
        }
    };

    const gooseArt = `
        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
        ░░░░░░░░░░░▄▄▄▄▄▄▄░░░░░░░░░░
        ░░░░░░░▄▀▀▀░░░░░░░▀▀▄░░░░░░░
        ░░░░░▄▀░░░░░░░░░░░░░░▀▄░░░░░
        ░░░▄▀░░░░░░░░░░▄░░░░░░░▀▄░░░
        ░░▄▀░░░░░░░░░░░█░░░░░░░░░▀▄░
        ░▄▀░░░░░░░░░░░░█░░░░░░░░░░░▀▄
        ░█░░░░░░░░░░░░░░█░░░░░░░░░░░█
        ░█░░░░░░░░░░░░▄█▄░░░░░░░░░░░█
        ░█░░░░░░░░░░░▄▀░▀▄░░░░░░░░░░█
        ░█░░░░░░░░░░▄▀░░░░▀▄░░░░░░░░█
        ░▀▄░░░░░░░░█░░░░░░░█░░░░░░░▄▀
        ░░▀▄░░░░░░░█▄░░░░▄█░░░░░░▄▀░
        ░░░▀▄░░░░░░░▀▀▀▀▀▀░░░░░░▄▀░░
        ░░░░░▀▄░░░░░░░░░░░░░░░▄▀░░░░
        ░░░░░░░▀▀▄▄▄▄▄▄▄▄▄▄▄▀▀░░░░░░
        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    `;

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!round) {
        return (
            <div style={{ padding: 24, textAlign: 'center' }}>
                <Title level={3}>Раунд не найден</Title>
                <Button onClick={() => navigate('/rounds')}>
                    Вернуться к списку раундов
                </Button>
            </div>
        );
    }

    return (
        <div style={{ padding: 24, minHeight: '100vh', background: '#f0f2f5' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <Card>
                    <div style={{ marginBottom: 24 }}>
                        <Button 
                            icon={<ArrowLeftOutlined />} 
                            onClick={() => navigate('/rounds')}
                            style={{ marginBottom: 16 }}
                        >
                            Назад к списку раундов
                        </Button>
                        
                        <Title level={2} style={{ margin: 0 }}>
                            Раунд {round.id}
                        </Title>
                    </div>

                    <Row gutter={[24, 24]}>
                        <Col xs={24} lg={12}>
                            <div style={{ textAlign: 'center' }}>
                                <div
                                    onClick={handleTap}
                                    style={{
                                        cursor: roundStatus === 'Активен' ? 'pointer' : 'not-allowed',
                                        fontSize: '12px',
                                        fontFamily: 'monospace',
                                        lineHeight: '1',
                                        whiteSpace: 'pre',
                                        color: '#666',
                                        userSelect: 'none',
                                        padding: '20px',
                                        border: '2px solid #d9d9d9',
                                        borderRadius: '8px',
                                        backgroundColor: roundStatus === 'Активен' ? '#f6ffed' : '#f5f5f5',
                                        transition: 'all 0.3s',
                                        opacity: tapping ? 0.7 : 1,
                                        transform: tapping ? 'scale(0.95)' : 'scale(1)',
                                    }}
                                >
                                    {gooseArt}
                                </div>
                                <Text style={{ display: 'block', marginTop: 16, fontSize: '16px' }}>
                                    {roundStatus === 'Активен' ? 'Кликай на гуся!' : 'Гусь недоступен'}
                                </Text>
                            </div>
                        </Col>

                        <Col xs={24} lg={12}>
                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                <div>
                                    <Text strong style={{ fontSize: '18px' }}>Статус раунда:</Text>
                                    <div style={{ marginTop: 8 }}>
                                        <Tag color={getStatusColor(roundStatus)} style={{ fontSize: '16px', padding: '4px 12px' }}>
                                            {roundStatus === 'Активен' ? 'Раунд активен!' : 
                                             roundStatus === 'Cooldown' ? 'Подготовка к раунду' : 
                                             'Раунд завершен'}
                                        </Tag>
                                    </div>
                                </div>

                                <div>
                                    <Text strong style={{ fontSize: '18px' }}>
                                        {roundStatus === 'Активен' ? 'До конца осталось:' : 
                                         roundStatus === 'Cooldown' ? 'До начала осталось:' : 
                                         'Время вышло'}
                                    </Text>
                                    <div style={{ marginTop: 8 }}>
                                        <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                                            {timeLeft}
                                        </Text>
                                    </div>
                                </div>

                                <div>
                                    <Text strong style={{ fontSize: '18px' }}>Мои очки:</Text>
                                    <div style={{ marginTop: 8 }}>
                                        <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                                            {score}
                                        </Text>
                                    </div>
                                </div>

                                {roundStatus === 'Завершен' && round.leader && (
                                    <div>
                                        <Text strong style={{ fontSize: '18px' }}>Победитель:</Text>
                                        <div style={{ marginTop: 8 }}>
                                            <Text style={{ fontSize: '20px', fontWeight: 'bold', color: '#faad14' }}>
                                                🏆 {round.leader}
                                            </Text>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <Text strong>Время начала:</Text>
                                    <div>{new Date(round.startTime).toLocaleString('ru-RU')}</div>
                                </div>

                                <div>
                                    <Text strong>Время окончания:</Text>
                                    <div>{new Date(round.endTime).toLocaleString('ru-RU')}</div>
                                </div>
                            </Space>
                        </Col>
                    </Row>
                </Card>
            </div>
        </div>
    );
};

export default Round; 