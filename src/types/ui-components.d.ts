declare module "@/components/ui/button" {
  import * as React from "react";

  export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link"
      | "primary"
      | "success"
      | "danger";
    size?: "default" | "sm" | "lg" | "icon";
    loading?: boolean;
    asChild?: boolean;
  }

  export const Button: React.ForwardRefExoticComponent<
    ButtonProps & React.RefAttributes<HTMLButtonElement>
  >;
  export const buttonVariants: Record<string, string>;
  export default Button;
}

declare module "@/components/ui/card" {
  import * as React from "react";

  export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    hover?: boolean;
  }
  export type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>;
  export type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

  export const Card: React.ForwardRefExoticComponent<
    CardProps & React.RefAttributes<HTMLDivElement>
  >;
  export const CardHeader: React.ForwardRefExoticComponent<
    CardProps & React.RefAttributes<HTMLDivElement>
  >;
  export const CardTitle: React.ForwardRefExoticComponent<
    CardTitleProps & React.RefAttributes<HTMLHeadingElement>
  >;
  export const CardDescription: React.ForwardRefExoticComponent<
    CardDescriptionProps & React.RefAttributes<HTMLParagraphElement>
  >;
  export const CardContent: React.ForwardRefExoticComponent<
    CardProps & React.RefAttributes<HTMLDivElement>
  >;
  export const CardFooter: React.ForwardRefExoticComponent<
    CardProps & React.RefAttributes<HTMLDivElement>
  >;
  export default Card;
}

declare module "@/components/ui/badge" {
  import * as React from "react";

  export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?:
      | "default"
      | "secondary"
      | "destructive"
      | "outline"
      | "success"
      | "warning";
  }

  export const Badge: React.ForwardRefExoticComponent<
    BadgeProps & React.RefAttributes<HTMLDivElement>
  >;
  export const badgeVariants: Record<string, string>;
  export default Badge;
}

declare module "@/components/ui/avatar" {
  import * as React from "react";

  export const Avatar: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
  >;
  export const AvatarImage: React.ForwardRefExoticComponent<
    React.ImgHTMLAttributes<HTMLImageElement> &
      React.RefAttributes<HTMLImageElement>
  >;
  export const AvatarFallback: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
  >;
  export default Avatar;
}

declare module "@/components/ui/progress" {
  import * as React from "react";

  export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: number;
    max?: number;
    indicatorClassName?: string;
  }

  export const Progress: React.ForwardRefExoticComponent<
    ProgressProps & React.RefAttributes<HTMLDivElement>
  >;
  export default Progress;
}

declare module "@/components/ui/progress" {
  import * as React from "react";

  export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: number;
    max?: number;
    indicatorClassName?: string;
  }

  export const Progress: React.ForwardRefExoticComponent<
    ProgressProps & React.RefAttributes<HTMLDivElement>
  >;
  export default Progress;
}
