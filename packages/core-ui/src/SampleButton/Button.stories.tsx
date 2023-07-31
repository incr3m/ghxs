import React from 'react';
import { action } from '@storybook/addon-actions';
import { Meta, StoryObj } from '@storybook/react';

import Button, { TSampleButtonProps } from '.';

const baseArgs: TSampleButtonProps = {
  sample: true,
};

export default {
  component: Button,
  args: baseArgs,
} satisfies Meta<typeof Button>;

type Story = StoryObj<typeof Button>;

export const Default: Story = {};
