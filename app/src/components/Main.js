import React from 'react';
import styled from 'styled-components';

import { List } from './List';
import { Create } from './Create';
import { useCryptailsList } from '../hooks/cryptails';

export function Main () {
  const { cryptails } = useCryptailsList(); 

  return (
    <Layout>
      <div>
        <List cryptails={cryptails} />
      </div>
      <div>
        <Create />
      </div>
    </Layout>
  );
}

const Layout = styled.div`
  display: flex;
  height: 100%;
  padding: 16px;

  & > div:first-child {
    flex: 1;
  }

  & > div:last-child {
    width: 450px;
  }
`;
