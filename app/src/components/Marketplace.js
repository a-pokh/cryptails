import React from 'react';
import styled from 'styled-components';

import { List } from './List';
import { useMarketplaceList } from '../hooks/marketplace';

export function Marketplace () {
  const { marketplaceCryptails } = useMarketplaceList();

  return (
    <Layout>
      <List cryptails={marketplaceCryptails} />
    </Layout>
  );
}

const Layout = styled.div`
  height: 100%;
  padding: 16px;
`;
