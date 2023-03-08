import React, { useRef, useState, useEffect } from 'react';
import Moveable from 'react-moveable';

const App = () => {
	const [moveableComponents, setMoveableComponents] = useState([]);
	const [selected, setSelected] = useState(null);
	const [photos, setPhotos] = useState([]);

	useEffect(() => {
		const fetchPhotos = async () => {
			fetch(`https://jsonplaceholder.typicode.com/photos`)
				.then(res => res.json())
				.then(response => setPhotos(response));
		};
		fetchPhotos();
	}, []);

	const fetchPhotos = async () => {
		fetch(`https://jsonplaceholder.typicode.com/photos/${Math.round(Math.random() * 100)}`)
			.then(res => res.json())
			.then(response => setPhotos(current => [...current, response.url]));
	};

	const addMoveable = () => {
		// Create a new moveable component and add it to the array
		const COLORS = ['red', 'blue', 'yellow', 'green', 'purple'];

		setMoveableComponents([
			...moveableComponents,
			{
				id: Math.floor(Math.random() * Date.now()),
				top: 0,
				left: 0,
				width: 100,
				height: 100,
				color: COLORS[Math.floor(Math.random() * COLORS.length)],
				updateEnd: true,
			},
		]);
	};

	const updateMoveable = (id, newComponent, updateEnd = false) => {
		const updatedMoveables = moveableComponents.map((moveable, i) => {
			if (moveable.id === id) {
				return { id, ...newComponent, updateEnd };
			}
			return moveable;
		});
		setMoveableComponents(updatedMoveables);
	};

	const handleResizeStart = (index, e) => {
		console.log('e', e.direction);
		// Check if the resize is coming from the left handle
		const [handlePosX, handlePosY] = e.direction;
		// 0 => center
		// -1 => top or left
		// 1 => bottom or right

		// -1, -1
		// -1, 0
		// -1, 1
		if (handlePosX === -1) {
			console.log('width', moveableComponents, e);
			// Save the initial left and width values of the moveable component
			const initialLeft = e.left;
			const initialWidth = e.width;

			// Set up the onResize event handler to update the left value based on the change in width
		}
	};
	const removeMoveable = () => {
		const filteredRemoveables = moveableComponents.filter(component => component.id !== selected);
		setMoveableComponents(filteredRemoveables);
	};

	return (
		<main style={{ height: '100vh', width: '100vw' }}>
			<button onClick={addMoveable}>Add Moveable1</button>
			<button onClick={removeMoveable}>Remove Moveable</button>
			<div
				id='parent'
				style={{
					position: 'relative',
					background: 'black',
					height: '80vh',
					width: '80vw',
				}}>
				{moveableComponents.map((item, index) => (
					<Component
						{...item}
						key={index}
						updateMoveable={updateMoveable}
						handleResizeStart={handleResizeStart}
						setSelected={setSelected}
						isSelected={selected === item.id}
						index={index}
						photos={photos}
					/>
				))}
			</div>
		</main>
	);
};

export default App;

const Component = ({
	updateMoveable,
	top,
	left,
	width,
	height,
	index,
	color,
	id,
	setSelected,
	isSelected = false,
	photos,
	updateEnd,
}) => {
	const ref = useRef();

	const [nodoReferencia, setNodoReferencia] = useState({
		top,
		left,
		width,
		height,
		index,
		color,
		id,
	});
	let parent = document.getElementById('parent');
	let parentBounds = parent?.getBoundingClientRect();
	const [frame, setFrame] = React.useState({
		translate: [0, 0],
	});
	const onResize = async e => {
		const { beforeTranslate } = e.drag;
		const initialLeft = e.left;
		const initialWidth = e.width;
		const newWidth = e.width;
		const deltaX = newWidth - initialWidth;
		let newLeft = initialLeft - deltaX;
		let newTop = beforeTranslate[1];

		if (newLeft + newWidth > parentBounds?.width) {
			newLeft = parentBounds?.width - newWidth;
		}

		if (newTop + e.height > parentBounds?.height) {
			newTop = parentBounds?.height - e.height;
		}

		updateMoveable(id, {
			top: newTop,
			left: newLeft,
			width: newWidth,
			height: e.height,
			color,
		});
	};

	const onResizeEnd = async e => {
		let newWidth = e.lastEvent?.width;
		let newHeight = e.lastEvent?.height;

		const positionMaxTop = top + newHeight;
		const positionMaxLeft = left + newWidth;

		frame.translate = beforeTranslate;
		if (positionMaxTop > parentBounds?.height) newHeight = parentBounds?.height - top;
		if (positionMaxLeft > parentBounds?.width) newWidth = parentBounds?.width - left;

		const { lastEvent } = e;
		const { drag } = lastEvent;
		const { beforeTranslate } = drag;

		const absoluteTop = top + beforeTranslate[1];
		const absoluteLeft = left + beforeTranslate[0];
		console.log(e);
		updateMoveable(
			id,
			{
				top: absoluteTop,
				left: absoluteLeft,
				width: newWidth,
				height: newHeight,
				color,
			},
			true
		);
	};

	return (
		<>
			<div
				ref={ref}
				className='draggable'
				id={'component-' + id}
				style={{
					position: 'absolute',
					top: top,
					left: left,
					width: width,
					height: height,
					// background: color,
					backgroundImage: `url(${photos[nodoReferencia.index].url})`,
				}}
				onClick={() => setSelected(id)}
			/>

			<Moveable
				target={isSelected && ref.current}
				resizable
				draggable
				keepRatio={true}
				onDrag={e => {
					let newTop = e.top;
					let newLeft = e.left;

					if (newTop < 0) {
						newTop = 0;
					} else if (newTop + e.height > parentBounds?.height) {
						newTop = parentBounds?.height - e.height;
					}

					if (newLeft < 0) {
						newLeft = 0;
					} else if (newLeft + e.width > parentBounds?.width) {
						newLeft = parentBounds?.width - e.width;
					}

					updateMoveable(id, {
						top: newTop,
						left: newLeft,
						width: e.width,
						height: e.height,
						color,
					});
				}}
				onResizeStart={e => {
					e.setOrigin(['%', '%']);
					e.dragStart && e.dragStart.set(frame.translate);
				}}
				onResize={onResize}
				onResizeEnd={onResizeEnd}
				throttleResize={1}
				renderDirections={['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se']}
				edge={false}
				zoom={1}
				origin={false}
				padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
			/>
		</>
	);
};
