import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import ImgAvatar from './ImgAvatar';

export default {
  //   title: 'Components/Molecules/ImgAvatar',
  //   component: PageTitle,
  // } as ComponentMeta<typeof PageTitle>;

  title: 'ImgAvatar',
  component: ImgAvatar,
  argTypes: {
    sx: { control: 'object' },
    status: {
      control: 'select',
      options: ['active', 'inactive', 'default'],
      defaultValue: 'default',
    },
    isSquare: {
      control: 'boolean',
      defaultValue: false,
    },
    size: {
      control: 'select',
      options: ['tiny', 'mini', 'small', 'medium', 'large'],
      defaultValue: 'small',
    },
  },
} as ComponentMeta<typeof ImgAvatar>;

const Template: ComponentStory<typeof ImgAvatar> = args => {
  return <ImgAvatar {...args} />;
};

export const Default = Template.bind({});
