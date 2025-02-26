/**
 * @author Vikhyat Singh<vikhyat.singh@314ecorp.com>
 * Image editor for menu
 */

import { SubtractSelection, Tailoring, Write } from '@icon-park/react';
import { Button, theme } from 'antd';
import React from 'react';

import { Menu } from '../utils/utils';

interface IProps {
	setMenu: React.Dispatch<React.SetStateAction<Menu | ''>>;
	menu: Menu | '';
}

const { useToken } = theme;

const EditorMenu: React.FC<IProps> = (props) => {
	const { setMenu, menu } = props;
	const { token } = useToken();
	const handleClick = (option: Menu) => () => {
		setMenu(option);
	};

	return (
		<div className='flex items-center gap-2 my-3'>
			<Button
				type='text'
				style={{ color: menu === Menu.ANNOTATE ? token.colorPrimary : '' }}
				icon={<Write />}
				size='large'
				onClick={handleClick(Menu.ANNOTATE)}
			>
				Annotate
			</Button>
			<Button
				type='text'
				style={{ color: menu === Menu.CROP ? token.colorPrimary : '' }}
				icon={<Tailoring />}
				size='large'
				onClick={handleClick(Menu.CROP)}
			>
				Crop
			</Button>
			<Button
				type='text'
				style={{ color: menu === Menu.BLUR ? token.colorPrimary : '' }}
				icon={<SubtractSelection />}
				size='large'
				onClick={handleClick(Menu.BLUR)}
			>
				Redact
			</Button>
		</div>
	);
};

export default EditorMenu;
