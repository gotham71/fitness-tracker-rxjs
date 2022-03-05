import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Subject, map, Subscription } from "rxjs";
import { UIService } from "../shared/ui.service";

import { Exercise } from "./exercise.model";

@Injectable()
export class TrainingService {
  exerciseChanged = new Subject<Exercise>();
  exercisesChanged = new Subject<Exercise[]>();
  finishedExercisesChanged = new Subject<Exercise[]>();

  private availableExercises: Exercise[] = [];
  private runningExercise: Exercise;
  private fbSubs: Subscription[] = [];

  constructor(
    private dbFireStore: AngularFirestore,
    private uiService: UIService
  ) {}

  fetchAvailableExercises() {
    this.fbSubs.push(
        this.dbFireStore
          .collection('availableExercises')
          .snapshotChanges()
          .pipe(
            map((docArray) => {
              return docArray.map((doc) => {
                return {
                  id: doc.payload.doc.id,
                  ...(doc.payload.doc.data() as Exercise)
                  //otra mnanera en vez del ... spread operator:
                  //name: doc.payload.data().name,
                  //duration: doc.payload.data().duration,
                  //calories: doc.payload.data().calories,
                };
              });
            })
          ).subscribe((exercises: Exercise[]) => {
            this.availableExercises = exercises;
            this.exercisesChanged.next([...this.availableExercises]);
          }, error => {
            this.uiService.loadingStateChanged.next(false);
            this.uiService.showSnackbar('Fetching Exercises failed, please try again later', null, 3000);
            this.exercisesChanged.next(null);
          })
    );
  }

  startExercise(selectedId: string) {
    this.runningExercise = this.availableExercises.find(ex => ex.id === selectedId);
    this.exerciseChanged.next({...this.runningExercise});
  }

  completeExercise() {
    this.addDataToDatabase({
      ...this.runningExercise,
      date: new Date(),
      state: 'completed'
    });
    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  cancelExercise(progress: number) {
    this.addDataToDatabase({
      ...this.runningExercise,
      duration: this.runningExercise.duration * (progress/100),
      calories: this.runningExercise.calories * (progress/100),
      date: new Date(),
      state: 'cancelled'
    });
    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  getRunningExercise() {
    return {...this.runningExercise};
  }

  fetchCompletedOrCancelledExercises() {
    this.fbSubs.push(this.dbFireStore.collection('finishedExercises').valueChanges().subscribe((exercises: Exercise[]) => {
      this.finishedExercisesChanged.next(exercises);
    }));
  }

  cancelSubscriptions() {
    this.fbSubs.forEach(fsSub => fsSub.unsubscribe());
  }

  private addDataToDatabase(exercise: Exercise) {
    this.dbFireStore.collection('finishedExercises').add(exercise);
  }
}
