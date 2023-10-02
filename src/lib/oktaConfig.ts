
export const oktaConfig ={


    clientId:"0oabi36i4aXSYWspc5d7",
    issuer:"https://dev-48989672.okta.com/oauth2/default",
    redirectUri:"http://localhost:3000/login/callback",
    scopes:['openid', 'profile', 'email'],
    pkce:true,
    disableHttpsCheck:true,
}