import { NgModule } from "@angular/core";
import { AngularFirestoreModule } from "@angular/fire/compat/firestore";
import { SharedModule } from "../shared/shared.module";

import { CurrentTrainingComponent } from "./current-training/current-training.component";
import { NewTrainingComponent } from "./new-training/new-training.component";
import { PastTrainingsComponent } from "./past-trainings/past-trainings.component";
import { TrainingComponent } from "./training.component";
import { StopTrainingComponent } from "./current-training/stop-training.component";
import { TrainingRoutingModule } from "./training-routing.module";

@NgModule({
  declarations: [CurrentTrainingComponent, TrainingComponent, NewTrainingComponent, PastTrainingsComponent, StopTrainingComponent],
  imports: [
    SharedModule,
    AngularFirestoreModule,
    TrainingRoutingModule
  ],
  exports: [],
  entryComponents: [StopTrainingComponent]
})

export class TrainingModule {}
