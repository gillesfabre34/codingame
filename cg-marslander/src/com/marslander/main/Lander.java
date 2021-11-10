package com.marslander.main;

import java.util.*;
import java.io.*;
import java.math.*;

/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/


public class Lander {

    int X;
    int Y;
    int hSpeed;
    int vSpeed;
    int power;
    int fuel;

    public Lander(int X, int Y) {
        this.X = X;
        this.Y = Y;
        this.hSpeed = 0;
        this.vSpeed = 0;
        this.power = 0;
        this.fuel = 5001;
    }

    @Override
    public String toString() {
        return "Lander{" +
                "X=" + X +
                ", Y=" + Y +
                ", hSpeed=" + hSpeed +
                ", vSpeed=" + vSpeed +
                ", power=" + power +
                ", fuel=" + fuel +
                '}';
    }

    public void adjustPower(){
        if(this.vSpeed < -35){
            this.power = 4;
        }
        else {
            this.power = 0;
        }
        this.print();
    }

    public void move(){
        this.vSpeed = this.vSpeed - 4 + this.power;
        this.Y += this.vSpeed;
        this.fuel -= this.power;
        this.print();
    }

    public void print() {
        System.out.println(this.toString());
    }
}