import React, { useState, useEffect } from 'react';
import { Button, Card, Row, Col, Typography, Tag, Space, message, Spin, DatePicker, Form, Modal } from 'antd';
import { PlusOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { roundAPI } from '../services/api';
import type { Round } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const RoundList: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [rounds, setRounds] = useState<Round[]>([]);
    const [loading, setLoading] = useState(true);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        loadRounds();
    }, []);

    const loadRounds = async () => {
        try {
            setLoading(true);
            const data = await roundAPI.getRounds();
            setRounds(data);
        } catch (error: any) {
            message.error(
                'Ошибка загрузки раундов: ' + (error.response?.data?.message || error.message)
            );
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: Round['status']) => {
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('ru-RU');
    };

    // Функция для определения статуса раунда
    const getRoundStatus = (round: Round): 'Активен' | 'Cooldown' | 'Завершен' => {
        const now = new Date().getTime();
        const startTime = new Date(round.startTime).getTime();
        const endTime = new Date(round.endTime).getTime();
        
        // Время кулдауна в миллисекундах (по умолчанию 0)
        const cooldownDuration = 0; // можно будет настроить позже
        const validStartTime = startTime + cooldownDuration;
        
        if (now < validStartTime) {
            return 'Cooldown';
        } else if (now >= validStartTime && now <= endTime) {
            return 'Активен';
        } else {
            return 'Завершен';
        }
    };

    const handleCreateRound = () => {
        setCreateModalVisible(true);
    };

    const handleCreateSubmit = async (values: { startTime: dayjs.Dayjs; endTime: dayjs.Dayjs }) => {
        try {
            setCreateLoading(true);
            
            const startTime = values.startTime.toISOString();
            const endTime = values.endTime.toISOString();
            
            await roundAPI.createRound(startTime, endTime);
            
            message.success('Раунд успешно создан!');
            setCreateModalVisible(false);
            form.resetFields();
            loadRounds(); // Обновляем список раундов
        } catch (error: any) {
            message.error(
                'Ошибка создания раунда: ' + (error.response?.data?.message || error.message)
            );
        } finally {
            setCreateLoading(false);
        }
    };

    const handleModalCancel = () => {
        setCreateModalVisible(false);
        form.resetFields();
    };

    const validateEndTime = (_: any, value: dayjs.Dayjs) => {
        const startTime = form.getFieldValue('startTime');
        if (!value || !startTime) {
            return Promise.resolve();
        }
        if (value.isBefore(startTime)) {
            return Promise.reject(new Error('Время окончания должно быть позже времени начала'));
        }
        return Promise.resolve();
    };

    const handleRoundClick = (roundId: string) => {
        navigate(`/round/${roundId}`);
    };

    return (
        <div style={{ padding: 24, minHeight: '100vh', background: '#f0f2f5' }}>
            <div style={{ background: '#fff', padding: 24, borderRadius: 8, marginBottom: 24 }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 24,
                    }}
                >
                    <div>
                        <Title level={2} style={{ margin: 0 }}>
                            Список раундов
                        </Title>
                        <Text type="secondary">Добро пожаловать, {user?.username}!</Text>
                    </div>
                    <Space>
                        {user?.isAdmin && (
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleCreateRound}
                            >
                                Создать раунд
                            </Button>
                        )}
                        <Button icon={<LogoutOutlined />} onClick={logout}>
                            Выйти
                        </Button>
                    </Space>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 48 }}>
                        <Spin size="large" />
                        <div style={{ marginTop: 16 }}>
                            <Text>Загрузка раундов...</Text>
                        </div>
                    </div>
                ) : (
                    <Row gutter={[16, 16]}>
                        {rounds.length > 0 ? (
                            rounds.map(round => (
                                <Col xs={24} sm={12} md={8} lg={6} key={round.id}>
                                    <Card
                                        hoverable
                                        style={{ height: '100%', cursor: 'pointer' }}
                                        bodyStyle={{ padding: 16 }}
                                        onClick={() => handleRoundClick(round.id)}
                                    >
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Text strong>Round ID:</Text>
                                                <Text code>{round.id}</Text>
                                            </div>

                                            <div>
                                                <Text strong>Начало:</Text>
                                                <br />
                                                <Text>{formatDate(round.startTime)}</Text>
                                            </div>

                                            <div>
                                                <Text strong>Конец:</Text>
                                                <br />
                                                <Text>{formatDate(round.endTime)}</Text>
                                            </div>

                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Text strong>Статус:</Text>
                                                <Tag color={getStatusColor(getRoundStatus(round))}>
                                                    {getRoundStatus(round)}
                                                </Tag>
                                            </div>

                                            {getRoundStatus(round) === 'Завершен' && round.leader && (
                                                <div>
                                                    <Text strong>Победитель:</Text>
                                                    <br />
                                                    <Text style={{ fontWeight: 'bold', color: '#faad14' }}>
                                                        🏆 {round.leader}
                                                    </Text>
                                                </div>
                                            )}
                                        </Space>
                                    </Card>
                                </Col>
                            ))
                        ) : (
                            <Col span={24}>
                                <div
                                    style={{
                                        textAlign: 'center',
                                        padding: 48,
                                        background: '#fff',
                                        borderRadius: 8,
                                    }}
                                >
                                    <Text type="secondary">Раунды не найдены</Text>
                                </div>
                            </Col>
                        )}
                    </Row>
                )}
            </div>

            <Modal
                title="Создание раунда"
                open={createModalVisible}
                onCancel={handleModalCancel}
                footer={null}
            >
                <Form
                    form={form}
                    onFinish={handleCreateSubmit}
                    layout="vertical"
                >
                    <Form.Item
                        name="startTime"
                        label="Начало раунда"
                        rules={[{ required: true, message: 'Пожалуйста, выберите время начала' }]}
                    >
                        <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="endTime"
                        label="Окончание раунда"
                        rules={[
                            { required: true, message: 'Пожалуйста, выберите время окончания' },
                            { validator: validateEndTime },
                        ]}
                    >
                        <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={createLoading}>
                            Создать раунд
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default RoundList;
