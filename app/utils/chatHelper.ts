import dayjs from 'dayjs';

export const humanTime = (ms?: number) =>
  ms ? dayjs(ms).format('h:mm A') : '';
