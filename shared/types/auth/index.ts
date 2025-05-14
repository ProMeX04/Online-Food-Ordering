

export interface IRegisterRequest {
    username: string;
    email: string;
    password: string;
}


export interface ILoginRequest {
    username: string;
    password: string;
}

export interface IUpdateUserRequest {
    username: string;
    email: string;
    password: string;
}

export interface IChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface IForgotPasswordRequest {
    email: string;
}

export interface IResetPasswordRequest {
    token: string;
    newPassword: string;
}

export interface IVerifyEmailRequest {
    token: string;
}

export interface IResendVerificationEmailRequest {
    email: string;
}

export interface IRefreshTokenRequest {
    token: string;
}
