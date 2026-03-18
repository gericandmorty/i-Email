import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'indigo'
    size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {
        const variants = {
            default: 'bg-[#213448] text-[#EAE0CF] hover:bg-[#547792] shadow-xl shadow-[#213448]/10',
            outline: 'border-2 border-[#547792] bg-transparent hover:bg-[#547792]/5 text-[#213448]',
            ghost: 'hover:bg-[#547792]/5 text-[#94B4C1] hover:text-[#213448]',
            secondary: 'bg-[#EAE0CF] text-[#213448] hover:bg-[#EAE0CF]/80 border-2 border-[#547792]',
            indigo: 'bg-[#94B4C1] text-[#213448] hover:bg-[#94B4C1]/90 shadow-xl shadow-[#94B4C1]/20',
        }
        const sizes = {
            default: 'h-12 px-6 py-2',
            sm: 'h-9 px-3',
            lg: 'h-14 px-8 text-base',
            icon: 'h-10 w-10',
        }

        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center rounded-2xl text-sm font-black uppercase tracking-widest transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#94B4C1] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
                    variants[variant],
                    sizes[size],
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("rounded-[40px] border-2 border-[#213448]/5 bg-white text-[#213448] shadow-[0_30px_70px_rgba(33,52,72,0.05)]", className)} {...props} />
)

const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex flex-col space-y-2 p-10", className)} {...props} />
)

const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={cn("text-3xl font-black leading-none tracking-tight text-[#213448] uppercase", className)} {...props} />
)

const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn("text-xs text-[#94B4C1] font-bold leading-relaxed uppercase tracking-widest", className)} {...props} />
)

const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("p-10 pt-0", className)} {...props} />
)

const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex items-center p-10 pt-0", className)} {...props} />
)

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-14 w-full rounded-2xl border-2 border-[#547792]/10 bg-[#EAE0CF]/30 px-5 py-2 text-sm text-[#213448] font-bold placeholder:text-[#94B4C1]/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#94B4C1]/10 transition-all focus:border-[#94B4C1]/50 disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
    ({ className, ...props }, ref) => (
        <label
            ref={ref}
            className={cn(
                "text-[10px] font-black leading-none text-[#547792] uppercase tracking-[0.2em] ml-2 mb-3 block",
                className
            )}
            {...props}
        />
    )
)
Label.displayName = "Label"

export { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Input, Label }
