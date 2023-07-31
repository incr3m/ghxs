import { Button as MuiButton, ButtonProps } from '@mui/material';

export type TSampleButtonProps = { sample?: boolean };

export default function SampleButton(props: TSampleButtonProps) {
  return <MuiButton>Sample button</MuiButton>;
}
