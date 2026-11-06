import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginForm {
    [key: string]: string | boolean;
    login: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        login: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <div className="flex min-h-screen w-full bg-white">
            <Head title="Iniciar Sesión" />

            {/* LADO IZQUIERDO: IMAGEN */}
            <div 
                className="hidden md:flex md:w-1/2 bg-cover bg-center bg-slate-100"
                style={{
                    backgroundImage: "url('/imagen.jpeg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'top center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <div className="w-full h-full bg-black/10"></div>
            </div>

            {/* LADO DERECHO: FORMULARIO */}
            <div className="flex w-full md:w-1/2 flex-col justify-center items-center p-8">
                
                <div className="w-full max-w-md space-y-8">
                    
                    {/* TÍTULO EN AZUL OSCURO */}
                    <div className="text-center">
                        <h1 className="text-3xl font-extrabold text-blue-900 tracking-wider uppercase">
                            Inicio de Sesión
                        </h1>
                        {status && <div className="mt-4 text-sm font-medium text-green-600">{status}</div>}
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={submit}>
                        
                        {/* Campo Usuario */}
                        <div className="space-y-1">
                            <Label htmlFor="login" className="text-blue-900 text-sm font-semibold">Usuario o correo</Label>
                            <Input
                                id="login"
                                type="text"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="username"
                                value={data.login}
                                onChange={(e) => setData('login', e.target.value)}
                                placeholder="Ingresa tu usuario"
                                className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-900 focus-visible:border-blue-900 h-11"
                            />
                            {errors.login && <span className="text-red-500 text-sm mt-1 block">{errors.login}</span>}
                        </div>

                        {/* Campo Contraseña */}
                        <div className="space-y-1">
                            <Label htmlFor="password" className="text-blue-900 text-sm font-semibold">Contraseña</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-900 focus-visible:border-blue-900 h-11 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-900 focus:outline-none"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.password && <span className="text-red-500 text-sm mt-1 block">{errors.password}</span>}
                        </div>

                        {/* Recordarme */}
                        <div className="flex items-center space-x-3 pt-2">
                            <Checkbox
                                id="remember"
                                checked={data.remember}
                                onCheckedChange={(checked) => setData('remember', checked === true)}
                                tabIndex={3}
                                className="border-slate-400 data-[state=checked]:bg-blue-900 data-[state=checked]:border-blue-900"
                            />
                            <Label htmlFor="remember" className="text-blue-900 font-medium cursor-pointer text-sm">
                                Recuérdame
                            </Label>
                        </div>

                        {/* BOTON*/}
                        <Button 
                            type="submit" 
                            tabIndex={4} 
                            disabled={processing}
                            className="w-full bg-blue-900 hover:bg-blue-950 text-white font-bold tracking-wider h-11 mt-6 shadow-md shadow-blue-900/20"
                        >
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            INGRESAR
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}