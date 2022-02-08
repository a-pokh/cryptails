import React  from 'react';
import styled from 'styled-components'; 

const IMG_URLS = [
  'https://thumbs.dreamstime.com/b/long-island-bar-party-cocktail-drink-nightclub-isolated-icon-sketch-drawing-long-island-bar-party-cocktail-drink-nightclub-118389308.jpg',
  'https://thumbs.dreamstime.com/b/arnold-palmer-bar-party-cocktail-drink-nightclub-isolated-icon-sketch-drawing-arnold-palmer-bar-party-cocktail-drink-nightclub-118389321.jpg',
  'https://webstockreview.net/images/jar-clipart-sweet-tea-2.jpg',
];

export function Card({ cryptail }) {
  const { name, ingridients, ownerAccount } = cryptail;
  const imgUrl = IMG_URLS[Math.floor(Math.random() * IMG_URLS.length)]

  return (
    <CardWrapper>
      <div className='image'>
        <img src={imgUrl} alt={name} />
      </div>
      <div className='body'>
        <h2>{name}</h2>
        <div>Ingridients: {ingridients}</div>
        <div className='owner'>Owner: {ownerAccount?.toString() || '-'}</div> 
      </div>
    </CardWrapper>
  );
}

const CardWrapper = styled.div`
  width: 280px;
  height: 400px;
  box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
  transition: 0.3s;
  padding: 8px;

  &:hover {
    box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
  }

  & > .image {
    width: 100%;
    height: 200px;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  & > .body {
    & > * {
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .owner {
       word-break: break-all;
    }
  }

  & > .footer {
  }
`;

