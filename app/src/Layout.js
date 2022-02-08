import React from 'react';
import { Link } from "react-router-dom";
import styled from 'styled-components';

import WalletWrapper, { ConnectButton } from './WalletWrapper';
import GlobalStyle from './gloablStyles';

function Header() {
  return (
    <HeaderWrapper>
      <ConnectButton />
      &nbsp;
      &nbsp;
      &nbsp;
      &nbsp;
      <Link to="/">List</Link> |{" "}
      <Link to="/marketplace">Marketplace</Link>
    </HeaderWrapper>
  );
}

function Layout ({ children }) {
  return (
    <>
      <GlobalStyle />
      <WalletWrapper>
        <Header />
        {children}
      </WalletWrapper>
    </>
  );
}

const HeaderWrapper = styled.div`
  width: 100%;
  padding: 8px;
  box-shadow: 0 4px 2px -2px gray;
`;

export default Layout;
