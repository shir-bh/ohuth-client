import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import boy from "./boy.svg";
import "./App.css";
import * as api from "./api";
import { FaGithub } from "react-icons/fa";
import qs from "query-string";
import styled from "styled-components";
import axios from "axios";

function App() {
  const [authenticated, set_authenticated] = useState(false);
  const [loading, set_loading] = useState(false);
  const [user, set_user] = useState(null);
  const [access_token, set_access_token] = useState(null);
  const [content, set_content] = useState("no content yet...");
  let userNameRef = "";
  let passwordRef = "";

  useEffect(() => {
    if (window.location.search && window.location.search.includes("token")) {
      console.log("search - ", window.location.search);
      const search = qs.parse(window.location.search);
      console.log("qs - ", search);
      const profile = JSON.parse(search.profile);
      const { token } = search;
      console.log("profile - ", profile);
      console.log("token - ", token);
      if (profile && token) {
        set_authenticated(true);
        set_user(profile);
        set_access_token(token);
        window.history.replaceState({}, document.title, "/");
      }
    } else if (!access_token) {
      const get_access = async () => {
        const response = await api.get_access_token();
        if ("access_token" in response && "profile" in response) {
          set_access_token(response.access_token);
          set_authenticated(true);
          set_user(JSON.parse(response.profile));
        } else {
          alert("please login");
        }
      };
      get_access();
    }
  }, [access_token]);

  const connect = (provider) => {
    set_loading(true);
    window.location.href = `http://localhost:3030/api/auth/${provider}`;
  };

  const logout = async (_) => {
    const response = await api.logout();
    if (response.message === "You are logged out") {
      set_authenticated(false);
      set_user(null);
      set_access_token(null);
    }
  };
  const get_protected = async (_) => {
    const token = access_token;
    const response = await api.get_protected({ token });
    set_content(response.payload);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { data } = await axios({
      method: "post",
      url: `http://localhost:3030/api/auth/login`,
      headers: { "x-access-token": access_token },
      data: {
        email: userNameRef.value,
        password: passwordRef.value,
      },
    });
    data.auth ? set_authenticated(true) : set_authenticated(false);
    data.user.photo = boy;
    set_user(data.user);
    console.log(data.user);
    console.log(data.token);
    set_access_token(data.token);
    console.log(data.user);
  };

  return (
    <Div>
      <H1>Auth Demo</H1>
      <Img src={logo} alt="logo" />

      <P>
        Authenticated:
        <span>{" " + authenticated}</span>
      </P>
      <P>
        Loading: <span>{" " + loading}</span>
      </P>
      <div className="profile-box">
        {user && (
          <>
            <P>{user.name}</P>
            <Img src={user && user.photo} alt="avatar" />
          </>
        )}
      </div>
      <div>
        <ButtonGit onClick={() => connect("github")}>
          <FaGithub />
        </ButtonGit>

        <Button onClick={get_protected}>Get Protected Content</Button>
        <ButtonLogout onClick={logout}>Logout</ButtonLogout>
      </div>
      <form onSubmit={handleLogin}>
        <Input
          placeholder="email"
          type="text"
          id="userName"
          name="userName"
          ref={(elem) => (userNameRef = elem)}
        />
        <Input
          placeholder="password"
          type="text"
          id="password"
          name="password"
          ref={(elem) => (passwordRef = elem)}
        />
        <Button>login</Button>
      </form>
      <P>{content}</P>
    </Div>
  );
}

export default App;

const Div = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #282c34;
`;
const Img = styled.img`
  height: 5rem;
`;
const H1 = styled.h1`
  color: white;
`;
const P = styled.p`
  color: white;
`;
const ButtonGit = styled.button`
  height: 2rem;
  margin: 1rem;
  width: 2rem;
  border-radius: 20%;
  border: none;
  background-color: #61dafb;
`;
const Button = styled.button`
  height: 2rem;
  border-radius: 3%;
  border: none;
  width: 10rem;
  background-color: #61dafb;
`;
const ButtonLogout = styled.button`
  height: 2rem;
  border-radius: 3%;
  border: none;
  width: 6rem;
  background-color: #61dafb;
  margin: 1rem;
`;
const Input = styled.input`
  height: 2rem;
  border-radius: 3%;
  border: none;
  background-color: #61dafb;
  margin: 0.5rem;
`;
