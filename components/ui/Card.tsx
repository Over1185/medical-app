import * as React from "react";

/** Contenedor base de tarjetas con borde, fondo y sombra consistente. */
export function Card({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={`rounded-xl border border-border bg-card text-foreground shadow-sm ${className}`}
            {...props}
        />
    );
}

/** Cabecera de tarjeta para título y metadatos. */
export function CardHeader({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />;
}

/** Título semántico de tarjeta. */
export function CardTitle({ className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props} />;
}

/** Cuerpo principal de tarjeta. */
export function CardContent({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={`p-6 ${className}`} {...props} />;
}
