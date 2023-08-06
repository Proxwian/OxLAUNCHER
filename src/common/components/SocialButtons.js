import {
  faDiscord,
  faFacebook,
  faGithub,
  faInstagram,
  faTwitter
} from '@fortawesome/free-brands-svg-icons';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { memo } from 'react';

const SocialButtons = () => {
  return (
    <div
      css={`
        display: flex;
        justify-content: space-between;
        margin-right: 30px;
        a {
          color: rgba(0,0,0,1);
        }
        div {
          width: 28px;
          height: 28px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 4px;
          transition: background 0.1s ease-in-out, transform 0.1s ease-in-out;
          &:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateY(-3px);
            cursor: pointer;
          }
        }
        div:first-child {
          margin-left: 0;
        }
      `}
    >
      
    </div>
  );
};

export default memo(SocialButtons);
