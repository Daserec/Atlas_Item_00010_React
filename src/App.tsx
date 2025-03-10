import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Flag, Bomb } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { motion } from 'framer-motion';

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
    const [flagsLeft, setFlagsLeft] = useState(INITIAL_FLAGS);

    // Initialize Game
    useEffect(() => {
        setBoard(createEmptyBoard());
        setIsGameOver(false);
        setIsGameWon(false);
        setFlagsLeft(INITIAL_FLAGS);
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
            return;
        }

        setBoard(newBoard);
        if (checkWinCondition(newBoard)) {
            setIsGameWon(true);
            setBoard(revealBoard(board));
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
                setFlagsLeft(prev => prev + 1);
            } else if (flagsLeft > 0) {
                currentTile.isFlagged = true;
                setFlagsLeft(prev => prev - 1);
            }
            setBoard(newBoard);
        }
    }, [board, isGameOver, isGameWon, flagsLeft]);

    const handleReset = () => {
        setBoard(createEmptyBoard());
        setIsGameOver(false);
        setIsGameWon(false);
        setFlagsLeft(INITIAL_FLAGS);
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

    const gameOverVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-200">Minesweeper</h1>

            <AlertDialog open={isGameOver} onOpenChange={setIsGameOver}>
                <AlertDialogTrigger asChild>
                    {isGameOver && (
                        <motion.p
                            variants={gameOverVariants}
                            initial="initial"
                            animate="animate"
                            className="text-red-500 font-bold mb-2"
                        >
                            Game Over! You hit a mine.
                        </motion.p>
                    )}
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Game Over</AlertDialogTitle>
                        <AlertDialogDescription>
                            You hit a mine! Would you like to restart the game?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleReset}>Restart</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={isGameWon} onOpenChange={setIsGameWon}>
                <AlertDialogTrigger asChild>
                    {isGameWon && (
                        <motion.p
                            variants={gameOverVariants}
                            initial="initial"
                            animate="animate"
                            className="text-green-500 font-bold mb-2"
                        >
                            You Win!
                        </motion.p>
                    )}
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>You Win!</AlertDialogTitle>
                        <AlertDialogDescription>
                            Congratulations! You&apos;ve cleared the minefield.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={handleReset}>Play Again</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="mb-2 text-gray-700 dark:text-gray-300">
                Flags Left: {flagsLeft}
            </div>
            <div
                className="grid gap-0.5 border border-gray-400 dark:border-gray-600 shadow-md"
                style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 44px)` }}
            >
                {board.map((row, rowIndex) => (
                    row.map((tile, colIndex) => (
                        <motion.div
                            key={`${rowIndex}-${colIndex}`}
                            variants={tileVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover="hover"
                            className={cn(
                                "w-8 h-8 flex items-center justify-center border border-gray-400 dark:border-gray-700 select-none",
                                {
                                    'bg-gray-300 dark:bg-gray-700': !tile.isRevealed && !tile.isFlagged,
                                    'bg-gray-200 dark:bg-gray-800': tile.isRevealed,
                                    'bg-yellow-400 dark:bg-yellow-600': tile.isFlagged,
                                    'cursor-pointer': !tile.isRevealed && !tile.isFlagged,
                                    'cursor-not-allowed': tile.isRevealed || tile.isFlagged,
                                }
                            )}
                            onClick={() => handleTileClick(rowIndex, colIndex)}
                            onContextMenu={(e) => handleTileRightClick(e, rowIndex, colIndex)}
                        >
                            {tile.isRevealed && (
                                tile.isMine ? (
                                    <Bomb className="text-red-600 w-5 h-5" />
                                ) : tile.adjacentMines > 0 ? (
                                    <span className={cn(
                                        "font-bold",
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
                                <Flag className="text-red-500 w-5 h-5" />
                            )}
                        </motion.div>
                    ))
                ))}
            </div>
            <motion.div variants={resetButtonVariants} whileHover="hover">
                <Button
                    onClick={handleReset}
                    className="mt-4 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded cursor-pointer"
                >
                    Reset Game
                </Button>
            </motion.div>
        </div>
    );
};

export default MinesweeperGame;