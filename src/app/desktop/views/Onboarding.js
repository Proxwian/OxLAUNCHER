import React, { useRef, useState, memo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLongArrowAltRight,
  faLongArrowAltUp,
  faLongArrowAltDown
} from '@fortawesome/free-solid-svg-icons';
import backgroundVideo from '../../../common/assets/onboarding.webm';
import { _getCurrentAccount } from '../../../common/utils/selectors';
import BisectHosting from '../../../ui/BisectHosting';
import KoFiButton from '../../../common/assets/ko-fi.png';
import { openModal } from '../../../common/reducers/modals/actions';

const Background = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background: ${props => props.theme.palette.colors.jungleGreen};
  overflow: hidden;
`;

const scrollToRef = ref =>
  ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });

const Home = () => {
  const dispatch = useDispatch();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [initScrolled, setInitScrolled] = useState(false);
  const account = useSelector(_getCurrentAccount);

  const firstSlideRef = useRef(null);
  const secondSlideRef = useRef(null);
  const thirdSlideRef = useRef(null);
  const forthSlideRef = useRef(null);
  const fifthSlideRef = useRef(null);
  const executeScroll = type => {
    if (currentSlide + type < 0 || currentSlide + type > 5) return;
    setCurrentSlide(currentSlide + type);
    switch (currentSlide + type) {
      case 0:
        scrollToRef(firstSlideRef);
        break;
      case 1:
        scrollToRef(secondSlideRef);
        break;
      case 2:
        scrollToRef(thirdSlideRef);
        break;
      default:
        scrollToRef(firstSlideRef);
        break;
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setInitScrolled(true);
      executeScroll(1);
    }, 4800);
  }, []);

  return (
    <Background>
      <div
        ref={firstSlideRef}
        css={`
          height: 100%;
          width: 100%;
          background: ${props => props.theme.palette.grey[800]};
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        `}
      >
        <div
          css={`
            font-size: 30px;
            font-weight: 700;
            text-align: center;
            padding: 0 120px;
          `}
        >
          {account.selectedProfile.name}, Добро Пожаловать!
          Спасибо за загрузку OxLAUNCHER :3
        </div>
      </div>
      <div
        ref={secondSlideRef}
        css={`
          height: 100%;
          width: 100%;
          background: ${props => props.theme.palette.grey[700]};
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        `}
      >
        <div
          css={`
				font-size: 24px;
				font-weight: 600;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				text-align: center;
				margin: 20%;
			  `}
        >
          <a href="https://discord.gg/Yy4y7tjKfY">Наш Discord сервер</a> 
          Вся  информация о сборках и лаунчере, а также новости проекта
          <iframe
            css={`
				  margin-top: 40px;
				`}
            src="https://discord.com/widget?id=1043933263565160498&theme=dark"
            width="350"
            height="320"
            allowTransparency="true"
            frameBorder="0"
            title="discordFrame"
          />
        </div>

      </div>
      <div
        ref={thirdSlideRef}
        css={`
          height: 100%;
          width: 100%;
          background: ${props => props.theme.palette.grey[700]};
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        `}
      >
        <div
          css={`
            font-size: 30px;
            font-weight: 700;
            text-align: center;
            padding: 0 120px;
          `}
        >
          Чтобы начать, скачай сборку OxMODPACK (или любую другую),
          нажав кнопку <b>+</b> в левом нижнем углу. Приятной игры!
        </div>
      </div>
      {currentSlide !== 0 && currentSlide !== 1 && initScrolled && (
        <div
          css={`
            position: fixed;
            right: 20px;
            top: 40px;
            transition: 0.1s ease-in-out;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 4px;
            font-size: 40px;
            cursor: pointer;
            width: 70px;
            height: 40px;
            color: ${props => props.theme.palette.text.icon};
            &:hover {
              background: ${props => props.theme.action.hover};
            }
          `}
          onClick={() => executeScroll(-1)}
        >
          <FontAwesomeIcon icon={faLongArrowAltUp} />
        </div>
      )}
      {currentSlide !== 0 && initScrolled && (
        <div
          css={`
            position: fixed;
            right: 20px;
            bottom: 20px;
            transition: 0.1s ease-in-out;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 4px;
            font-size: 40px;
            cursor: pointer;
            width: 70px;
            height: 40px;
            color: ${props => props.theme.palette.text.icon};
            &:hover {
              background: ${props => props.theme.action.hover};
            }
          `}
          onClick={() => {
            if (currentSlide === 2) {
              dispatch(push('/home'));
            } else {
              executeScroll(1);
            }
          }}
        >
          <FontAwesomeIcon
            icon={currentSlide === 2 ? faLongArrowAltRight : faLongArrowAltDown}
          />
        </div>
      )}
      dispatch(push('/home'));
    </Background>
  );
};

export default memo(Home);
