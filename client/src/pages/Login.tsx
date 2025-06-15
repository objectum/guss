import React, { useEffect } from 'react';
import { Form, Input, Button, Card, Alert, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { LoginRequest } from '../types';

const { Title } = Typography;

const Login: React.FC = () => {
    const { login, loading, error, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/rounds');
        }
    }, [isAuthenticated, navigate]);

    const onFinish = async (values: LoginRequest) => {
        await login(values.username, values.password);
    };

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: '#f0f2f5',
            }}
        >
            <Card style={{ width: 400, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={2}>Вход в систему</Title>
                </div>

                <Form
                    form={form}
                    name="login"
                    onFinish={onFinish}
                    autoComplete="off"
                    layout="vertical"
                >
                    <Form.Item
                        label="Имя пользователя"
                        name="username"
                        rules={[
                            { required: true, message: 'Пожалуйста, введите имя пользователя!' },
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Имя пользователя"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Пароль"
                        name="password"
                        rules={[{ required: true, message: 'Пожалуйста, введите пароль!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Пароль"
                            size="large"
                        />
                    </Form.Item>

                    {error && (
                        <Form.Item>
                            <Alert
                                message={error}
                                type="error"
                                showIcon
                                style={{ marginBottom: 16 }}
                            />
                        </Form.Item>
                    )}

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            size="large"
                            block
                        >
                            Войти
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
