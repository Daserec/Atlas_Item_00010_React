Of course! Here is the code that implements a Minesweeper game in built on React with Typescript, where users can uncover tiles, flag potential mines, and reveal the entire board when the game is over.

<br>
```tsx
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Bomb, Flag } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { MotionDiv } from '@/components/common/motion';
// Types and Interfaces
interface Tile {
    isMine: boolean;
    isRevealed: boolean;
    isFlagged: boolean;
    adjacentMines: number;
}
type Board = Tile[][];
// Constants
const BOARD_SIZE = 10;
const NUM_MINES = 15;
const INITIAL_FLAGS = 10;
// Helper Functions
// Create a random board based on the initial amount of mines specified in NUM_MINES variable.
const createEmptyBoard = (): Board => {
    const newBoard: Board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0,
    })));
    let minesPlaced = 0;
    while (minesPlaced < NUM_MINES) {
        const row = Math.floor(Math.random() * BOARD_SIZE);
        const col = Math.floor(Math.random() * BOARD_SIZE);import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Bomb, Flag } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';

import { motion, type MotionProps } from 'framer-motion';

// Define types for different HTML elements with motion props
type MotionDivProps = MotionProps & React.HTMLAttributes<HTMLDivElement>;

// Export typed motion components
export const MotionDiv = motion.div as React.FC<MotionDivProps>

// Types and Interfaces
interface Tile {
    isMine: boolean;
    isRevealed: boolean;
    isFlagged: boolean;
    adjacentMines: number;
}

type Board = Tile[][];

// Constants
const BOARD_SIZE = 10;
const NUM_MINES = 15;

// Helper Functions

// Create a random board based on the initial amount of mines specified in NUM_MINES variable.
const createEmptyBoard = (): Board => {
    const newBoard: Board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0,
    })));

    let minesPlaced = 0;
    while (minesPlaced < NUM_MINES) {
        const row = Math.floor(Math.random() * BOARD_SIZE);
        const col = Math.floor(Math.random() * BOARD_SIZE);
        if (!newBoard[row][col].isMine) {
            newBoard[row][col].isMine = true;
            minesPlaced++;
        }
    }

    return calculateAdjacentMines(newBoard);
};

const placeMines = (board: Board, numMines: number, initialClickRow: number, initialClickCol: number): Board => {
    const newBoard = board.map(row => [...row]);
    let minesPlaced = 0;

    while (minesPlaced < numMines) {
        const row = Math.floor(Math.random() * BOARD_SIZE);
        const col = Math.floor(Math.random() * BOARD_SIZE);

        // Ensure mine is not placed on initial click or existing mine
        if (!newBoard[row][col].isMine && !(row === initialClickRow && col === initialClickCol)) {
            newBoard[row][col] = { ...newBoard[row][col], isMine: true };
            minesPlaced++;
        }
    }

    return newBoard;
};

const calculateAdjacentMines = (board: Board): Board => {
    const newBoard = board.map(row => [...row]);

    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            let count = 0;
            if (!newBoard[row][col].isMine) {
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (i === 0 && j === 0) continue;
                        const newRow = row + i;
                        const newCol = col + j;
                        if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
                            if (newBoard[newRow][newCol].isMine) {
                                count++;
                            }
                        }
                    }
                }
                newBoard[row][col] = { ...newBoard[row][col], adjacentMines: count };
            }
        }
    }
    return newBoard;
};

const revealTile = (board: Board, row: number, col: number): Board => {
    const newBoard = board.map(row => [...row]);
    const currentTile = newBoard[row][col];

    if (currentTile.isRevealed || currentTile.isFlagged) {
        return newBoard;
    }

    currentTile.isRevealed = true;

    if (currentTile.adjacentMines === 0) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const newRow = row + i;
                const newCol = col + j;
                if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
                    revealTile(newBoard, newRow, newCol);
                }
            }
        }
    }

    return newBoard;
};

const checkWinCondition = (board: Board): boolean => {
    const numRevealed = board.flat().filter(tile => tile.isRevealed && !tile.isMine).length;
    return numRevealed === BOARD_SIZE * BOARD_SIZE - NUM_MINES;
};

const revealBoard = (board: Board): Board => {
    return board.map(row => row.map(tile => ({ ...tile, isRevealed: true })));
};

// Main Component
const MinesweeperGame = () => {
    const [board, setBoard] = useState<Board>(createEmptyBoard());
    const [isGameOver, setIsGameOver] = useState(false);
    const [isGameWon, setIsGameWon] = useState(false);
    const [minesLeft, setMinesLeft] = useState(NUM_MINES);
    const [shakeFlags, setShakeFlags] = useState(false);

    // Initialize Game
    useEffect(() => {
        setBoard(createEmptyBoard());
        setIsGameOver(false);
        setIsGameWon(false);
        setMinesLeft(NUM_MINES);
    }, []);

    const handleTileClick = useCallback((row: number, col: number) => {
        if (isGameOver || isGameWon) return;

        if (board.flat().every(tile => !tile.isMine && !tile.isRevealed)) {
            let newBoard = placeMines(board, NUM_MINES, row, col);
            newBoard = calculateAdjacentMines(newBoard);
            setBoard(newBoard);
        }

        let newBoard = revealTile(board, row, col);

        if (newBoard[row][col].isMine) {
            setIsGameOver(true);
            setBoard(revealBoard(board));
            toast.error(
                <div onClick={() => toast.dismiss()}>
                    <p>Oops! You hit a mine. Game Over</p>
                </div>, {
                duration: 5000,
            });
            return;
        }

        setBoard(newBoard);
        if (checkWinCondition(newBoard)) {
            setIsGameWon(true);
            setBoard(revealBoard(board));
            toast.success(
                <div onClick={() => toast.dismiss()}>
                    <p>Congratulations! You've cleared the minefield.</p>
                </div>, {
                duration: 5000,
            });
        }

    }, [board, isGameOver, isGameWon]);

    const handleTileRightClick = useCallback((event: React.MouseEvent, row: number, col: number) => {
        event.preventDefault();

        if (isGameOver || isGameWon) return;

        const newBoard = board.map(row => [...row]);
        const currentTile = newBoard[row][col];

        if (!currentTile.isRevealed) {
            if (currentTile.isFlagged) {
                currentTile.isFlagged = false;
                setMinesLeft(prev => prev + 1);
            } else {
                currentTile.isFlagged = true;
                setMinesLeft(prev => prev - 1);
            }
            setBoard(newBoard);
        }
    }, [board, isGameOver, isGameWon, minesLeft]);

    const handleReset = () => {
        setBoard(createEmptyBoard());
        setIsGameOver(false);
        setIsGameWon(false);
        setMinesLeft(NUM_MINES);
        toast.dismiss();
    };

    // Animation Variants
    const tileVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
        hover: {
            scale: 1.1,
            boxShadow: "0px 0px 10px 2px rgba(100, 149, 237, 0.5)", // Cornflower Blue
            transition: { duration: 0.1 },
        },
    };

    const resetButtonVariants = {
        hover: { scale: 1.05, boxShadow: "0px 0px 5px rgba(0,0,0,0.2)", transition: { duration: 0.2 } },
    };

    const minesLeftVariants = {
        shake: {
            x: [0, -2, 2, -2, 2, 0], // Shake左右震动
            transition: { duration: 0.5, repeat: 0 },
        },
        noShake: {
            x: 0,
            transition: { duration: 0.5 },
        },
    };

    // Flags Left change effect
    useEffect(() => {
        setShakeFlags(true);
        const timer = setTimeout(() => {
            setShakeFlags(false);
        }, 500); // 0.5 seconds same as animation duration
        return () => clearTimeout(timer);
    }, [minesLeft]);

    return (
        <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 bg-gray-900">
            <h1 className="text-3xl mt-4 font-bold mb-4 text-gray-200">Minesweeper</h1>

            <div
                className="grid gap-0.5 border border-gray-600 shadow-md mb-4"
                style={{
                    gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(24px, 36px))`, // Responsive tile size
                    maxWidth: '90vw', // Responsive board width
                }}
            >
                {board.map((row, rowIndex) => (
                    row.map((tile, colIndex) => (
                        <MotionDiv
                            key={`${rowIndex}-${colIndex}`}
                            variants={tileVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover={(!isGameOver && !isGameWon) ? "hover" : {}}
                            className={cn(
                                "aspect-square flex items-center justify-center border border-gray-700 select-none",
                                {
                                    'bg-gray-700': !tile.isRevealed && !tile.isFlagged,
                                    'bg-gray-800': tile.isRevealed,
                                    'bg-yellow-600': tile.isFlagged,
                                    'cursor-pointer': (!tile.isRevealed && !tile.isFlagged && !isGameOver && !isGameWon),
                                    'cursor-not-allowed': tile.isRevealed || tile.isFlagged || isGameOver || isGameWon,
                                }
                            )}
                            onClick={() => (isGameOver || isGameWon) ? {} : handleTileClick(rowIndex, colIndex)}
                            onContextMenu={(e: any) => (isGameOver || isGameWon) ? e.preventDefault() : handleTileRightClick(e, rowIndex, colIndex)}
                        >
                            {tile.isRevealed && (
                                tile.isMine ? (
                                    <Bomb className="text-red-600 w-4 h-4 sm:w-5 sm:h-5" /> // Responsive icon size
                                ) : tile.adjacentMines > 0 ? (
                                    <span className={cn(
                                        "font-bold text-sm sm:text-base", // Responsive font size
                                        {
                                            'text-blue-500': tile.adjacentMines === 1,
                                            'text-green-500': tile.adjacentMines === 2,
                                            'text-red-500': tile.adjacentMines === 3,
                                            'text-purple-500': tile.adjacentMines === 4,
                                            'text-orange-500': tile.adjacentMines === 5,
                                            'text-yellow-500': tile.adjacentMines === 6,
                                            'text-pink-500': tile.adjacentMines === 7,
                                            'text-gray-500': tile.adjacentMines === 8,
                                        }
                                    )}>
                                        {tile.adjacentMines}
                                    </span>
                                ) : (
                                    ''
                                )
                            )}
                            {!tile.isRevealed && tile.isFlagged && (
                                <Flag className="text-red-500 w-4 h-4 sm:w-5 sm:h-5" /> // Responsive icon size
                            )}
                        </MotionDiv>
                    ))
                ))}
            </div>
            <div className="flex items-center justify-center w-full max-w-[90vw]">
                <div className="text-gray-300 select-none flex items-center gap-1 mr-4">
                    <span>Mines Left: </span>
                    <motion.span
                        variants={minesLeftVariants}
                        animate={shakeFlags ? "shake" : "noShake"}
                        style={{
                            color: minesLeft < 0 ? "#FFAAAA" : "white", // Soft Red
                        }}
                    >
                        {minesLeft}
                    </motion.span>
                </div>
                <MotionDiv variants={resetButtonVariants} whileHover="hover">
                    <Button
                        onClick={handleReset}
                        className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded cursor-pointer text-sm sm:text-base" // Responsive font size
                    >
                        Reset Game
                    </Button>
                </MotionDiv>
            </div>
            <Toaster richColors position="top-center" />
        </div>
    );
};

export default MinesweeperGame;
```

The `MinesweeperGame` React component includes all funcionality related to the Game:

* Clicking on tiles: `handleTileClick` method handles the users clicks on tiles and reveals the underneath value (number, empty square or mine)
* Right clicking on tiles: `handleTileRightClick` handles flag insertion and removal.
* Reset game button: `handleReset` function takes care of resetting the game.
<br>

If you would like to add more feratures such as game difficulty changing toobar, I'm at your disposition.