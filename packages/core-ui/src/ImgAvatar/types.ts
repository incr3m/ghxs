import { SxProps, AvatarProps } from '@mui/material';

export type TImgAvatar = {
  isSquare?: boolean;
  size?: 'tiny' | 'mini' | 'small' | 'medium' | 'large' | 'xlarge';
  status?: 'active' | 'inactive' | 'default';
  avatarProps?: AvatarProps;
  imgProps?: AvatarProps['imgProps'];
  src: string;
  sx?: SxProps;
};
