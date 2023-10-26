import request from 'utils/request';

const group = 'v1-fake';

export function getName() {
  return request({
    url: `/${group}/getName`,
    method: 'GET',
  });
}
