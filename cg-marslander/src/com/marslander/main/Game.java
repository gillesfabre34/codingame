package com.marslander.main;

import java.util.Scanner;

/**
 * Created by gilles on 07/05/17.
 */
public class Game {

    int X;
    int Y;
    int hSpeed;
    int vSpeed;
    int fuel;
    int rotate;
    int power;
    int turn;
    Lander lander;

    public Game(int X, int Y, int hSpeed, int vSpeed, int fuel, int rotate, int power) {
        this.X = X;
        this.Y = Y;
        this.hSpeed = hSpeed;
        this.vSpeed = vSpeed;
        this.fuel = fuel;
        this.rotate = rotate;
        this.power = power;
        this.lander = new Lander(this.X,this.Y);
        this.turn = 0;
        System.out.println("Game.Game");
        //this.launch();
    }

    @Override
    public String toString() {
        return "Game{" +
                "X=" + X +
                ", Y=" + Y +
                ", hSpeed=" + hSpeed +
                ", vSpeed=" + vSpeed +
                ", fuel=" + fuel +
                ", rotate=" + rotate +
                ", power=" + power +
                ", turn=" + turn +
                ", lander=" + lander +
                '}';
    }

    public void print(){
        System.out.println(this.toString());
    }

    public void launch(){
        while(this.lander.Y > 0 && this.turn < 1000){
            this.lander.adjustPower();
            this.lander.move();
            this.print();
        }
    }

    public int getX() {
        return X;
    }

    public void setX(int x) {
        X = x;
    }

    public int getY() {
        return Y;
    }

    public void setY(int y) {
        Y = y;
    }

    public int gethSpeed() {
        return hSpeed;
    }

    public void sethSpeed(int hSpeed) {
        this.hSpeed = hSpeed;
    }

    public int getvSpeed() {
        return vSpeed;
    }

    public void setvSpeed(int vSpeed) {
        this.vSpeed = vSpeed;
    }

    public int getFuel() {
        return fuel;
    }

    public void setFuel(int fuel) {
        this.fuel = fuel;
    }

    public int getRotate() {
        return rotate;
    }

    public void setRotate(int rotate) {
        this.rotate = rotate;
    }

    public int getPower() {
        return power;
    }

    public void setPower(int power) {
        this.power = power;
    }
}
