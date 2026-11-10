import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            {/* Contenedor con borde y fondo del tema. overflow-hidden para que el logo no se salga */}
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-primary bg-primary/10 shadow-sm transition-all hover:bg-primary/20 overflow-hidden">
                
                {/* h-full w-full para que ocupe todo. -scale-x-100 para voltearlo horizontalmente */}
                <AppLogoIcon className="h-full w-full fill-current text-primary -scale-x-100" />
            </div>
            
            <div className="ml-3 grid flex-1 text-left">
                <span className="mb-0.5 truncate leading-tight font-bold text-foreground text-base">
                    SIGAI
                </span>
                <span className="text-xs text-muted-foreground truncate font-medium">
                    FUNDACITE
                </span>
            </div>
        </>
    );
}