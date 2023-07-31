import React from 'react';
import Avatar from '@mui/material/Avatar';
import { TImgAvatar } from './types';

const ImgAvatar = (props: TImgAvatar) => {
  const { size, isSquare, status, sx, src, imgProps, avatarProps } = props;

  const style = React.useMemo(
    () => ({
      width:
        size === 'tiny'
          ? '16px'
          : size === 'mini'
          ? '24px'
          : size === 'small'
          ? '32px'
          : size === 'large'
          ? '56px'
          : undefined,
      height:
        size === 'tiny'
          ? '16px'
          : size === 'mini'
          ? '24px'
          : size === 'small'
          ? '32px'
          : size === 'large'
          ? '56px'
          : undefined,
      border:
        status === 'active'
          ? '2px solid #1AE970'
          : status === 'inactive'
          ? '2px solid #F4F5F7'
          : '2px solid #05264a20',

      // borderRadius: isSquare ? '0px' : '15px',
      // ...(size === 'tiny' && {
      //   borderRadius: '6px',
      // }),
      // ...(size === 'mini' && {
      //   borderRadius: '8px',
      // }),
      // ...(size === 'small' && {
      //   borderRadius: '13px',
      // }),

      ...(isSquare
        ? { borderRadius: '0px' }
        : {
            borderRadius:
              size === 'tiny'
                ? '6px'
                : size === 'mini'
                ? '8px'
                : size === 'small'
                ? '13px'
                : size === 'medium'
                ? '14px'
                : size === 'large'
                ? '15px'
                : undefined,
          }),

      ...sx,
    }),
    [isSquare, size, status, sx],
  );

  return <Avatar sx={{ ...style }} src={src} imgProps={imgProps} {...avatarProps} />;
};

export default ImgAvatar;
