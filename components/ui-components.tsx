import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent' | 'indigo'
    size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {
        const variants = {
            default: 'bg-[#21262D] text-[#C9D1D9] hover:bg-[#30363D] hover:text-[#E6EDF3] border border-[#30363D] shadow-sm',
            primary: 'bg-[#238636] text-white hover:bg-[#2EA043] border border-[rgba(240,246,252,0.1)] shadow-sm font-semibold',
            secondary: 'bg-[#21262D] text-[#C9D1D9] hover:bg-[#30363D] hover:text-[#E6EDF3] border border-[#30363D] shadow-sm',
            outline: 'border border-[#30363D] bg-transparent hover:bg-[#21262D] text-[#C9D1D9] hover:text-[#E6EDF3]',
            ghost: 'hover:bg-[#21262D] text-[#8B949E] hover:text-[#E6EDF3]',
            danger: 'bg-[#21262D] text-[#F85149] hover:bg-[#B62324] hover:text-white border border-[#30363D] hover:border-[#F85149]',
            accent: 'bg-[#1F6FEB] text-white hover:bg-[#388BFD] border border-transparent shadow-sm',
            indigo: 'bg-[#1F6FEB] text-white hover:bg-[#388BFD] border border-transparent shadow-sm',
        }
        const sizes = {
            default: 'h-9 px-4 py-1.5 text-xs font-semibold',
            sm: 'h-7 px-2.5 py-1 text-xs font-medium',
            lg: 'h-11 px-6 py-2.5 text-sm font-semibold',
            icon: 'h-8 w-8 p-1.5',
        }

        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58A6FF] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
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
    <div className={cn("rounded-lg border border-[#30363D] bg-[#161B22] text-[#E6EDF3] shadow-sm", className)} {...props} />
)

const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex flex-col space-y-1.5 p-5 border-b border-[#30363D]/60", className)} {...props} />
)

const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={cn("text-sm font-semibold leading-none tracking-normal text-[#E6EDF3]", className)} {...props} />
)

const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn("text-xs text-[#8B949E] leading-normal font-normal", className)} {...props} />
)

const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("p-5", className)} {...props} />
)

const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex items-center p-5 pt-0 border-t border-[#30363D]/60", className)} {...props} />
)

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-9 w-full rounded-md border border-[#30363D] bg-[#0D1117] px-3 py-1.5 text-xs text-[#E6EDF3] placeholder:text-[#8B949E]/70 focus-visible:outline-none focus-visible:border-[#58A6FF] focus-visible:ring-1 focus-visible:ring-[#58A6FF] transition-colors disabled:cursor-not-allowed disabled:opacity-50",
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
                "text-xs font-semibold leading-none text-[#E6EDF3] mb-1.5 block",
                className
            )}
            {...props}
        />
    )
)
Label.displayName = "Label"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'accent' | 'muted'
}

const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => {
    const variants = {
        default: 'bg-[#21262D] text-[#C9D1D9] border-[#30363D]',
        success: 'bg-[#238636]/15 text-[#3FB950] border-[#238636]/40',
        warning: 'bg-[#D29922]/15 text-[#D29922] border-[#D29922]/40',
        danger: 'bg-[#F85149]/15 text-[#F85149] border-[#F85149]/40',
        accent: 'bg-[#388BFD]/15 text-[#58A6FF] border-[#388BFD]/40',
        muted: 'bg-[#161B22] text-[#8B949E] border-[#30363D]',
    }

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border tracking-wide",
                variants[variant],
                className
            )}
            {...props}
        />
    )
}

export { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Input, Label, Badge }
