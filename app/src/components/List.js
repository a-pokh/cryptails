import React  from 'react';
import styled from 'styled-components'; 

import { Card } from './Card';

export function List({ cryptails = [] }) {
  return (
    <MainWrapper>
      {cryptails.map(function(cryptail) {
        return <Card key={cryptail.name} cryptail={cryptail} />
      })}
    </MainWrapper>
  );
}

const MainWrapper = styled.div`
  display: flex;

  & > * {
    margin-right: 12px;
  }
`;

