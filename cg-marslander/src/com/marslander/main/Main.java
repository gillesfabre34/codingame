package com.marslander.main;

import java.util.Scanner;

/**
 * Created by gilles on 07/05/17.
 */
public class Main {
    public static void main(String[] args) {
        Game game = new Game(2500,2500,0,0,5001,0,0);
        game.print();
        game.launch();
    }
}



