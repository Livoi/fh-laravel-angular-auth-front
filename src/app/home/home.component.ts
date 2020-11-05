import { Component, OnInit } from '@angular/core';
import { JwtHelperService } from '../services/jwt-helper.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { GrantApiService } from '../services/grant-api.service';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Grant } from '../services/model/grant';

interface StatusOption {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})


export class HomeComponent implements OnInit {

  // Variables
  grantList: Grant[];
  accessToken: any;
  accessTokenDetails: any;
  loading: boolean;
  grantMessage: string;
  form: FormGroup;
  grantForm: FormGroup;
  errors: boolean;
  datasComMovimentacoes: any;
  statusoptions: StatusOption[] = [
    //{value: 'Select Status Options', viewValue: 'Select Status Options'},
    {value: 'In Consideration', viewValue: 'In Consideration'},
    {value: 'Development', viewValue: 'Development'},
    {value: 'Submitted', viewValue: 'Submitted'},    
    {value: 'Did Not Submit', viewValue: 'Did Not Submit'},
    {value: 'Implementation', viewValue: 'Implementation'},
    {value: 'Not Awardedt', viewValue: 'Not Awarded'},
    {value: 'Closeout', viewValue: 'Closeout'},
    {value: 'Closed', viewValue: 'Closed'}
  ];//In Consideration, Development, Submitted, Did Not Submit, Implementation, Not Awarded, Closeout, Closed
  selectedStatusOption: any;//this.statusoptions[1]; 
  selectedStatusOption_: any;

  constructor(
    fb: FormBuilder,
    jwtHelper: JwtHelperService,
    private authService: AuthService,
    public grantApiService: GrantApiService,
    private router: Router
  ) {
    
    this.form = fb.group({
      id:[''],
      exampleFormControlSelect1:[''],
      grant_name: ['',Validators.required],
      grant_status: ['',Validators.required],
      grantor: ['',Validators.required],
      grant_geo_location: ['',Validators.required],
      grant_description: ['',Validators.required],
      grant_amount: ['', [Validators.required,Validators.pattern("^[0-9]{1,10}$")]],
      grant_amount_currency: ['',Validators.required]
    });
    //const toSelect = this.statusoptions.find(c => c.value == this.local_data.InvestmentType );
    //this.form.get('exampleFormControlSelect1').setValue(this.statusoptions[1]);
    this.refreshGrantList();

    this.accessToken = localStorage.getItem('access_token');
    this.accessTokenDetails = {
      id: jwtHelper.id(),
      name: jwtHelper.name(),
      email: jwtHelper.email()
    };
  }

  ngOnInit(): void { 
    this.resetForm();
    this.refreshGrantList();

  }


  resetForm(form?: NgForm) {
    if (form) {
      form.reset();
    }
    this.grantApiService.selectedGrant = {
      id: '',
      grant_name: '',
      grant_status: '',
      grantor: '',
      grant_geo_location: '',
      grant_description: '',
      grant_amount: '',
      grant_amount_currency: ''
    };
  }


  onSubmit() {
    this.errors = false;
    if (this.form.value.id === '') {
      this.grantApiService.saveGrant(this.form.value).subscribe((res) => {
        
        this.resetForm();
        this.refreshGrantList();
        //this.toastr.success('Successfully Saved!');
      },
      err => {
        //this.toastr.error(err.error);
        console.log(err);
        this.errors = true;
      });
    } else {
  
      this.grantApiService.updateGrant(this.form.value.id, this.form.value).subscribe((res) => {
        this.resetForm();
        this.refreshGrantList();
        //this.toastr.success('Successfully Updated!');
      },
      err => {
        //this.toastr.error('Error!');
        console.log(err);
        this.errors = true;
      });
    }
  }

  

  onEdit(grt: Grant) {
    //console.log("onEdit Start");
    this.grantApiService.selectedGrant = Object.assign({}, grt);
    const toSelect = this.statusoptions.find(c => c.value == this.grantApiService.selectedGrant.grant_status);
    alert(JSON.stringify(toSelect));
    //this.form.get('exampleFormControlSelect1').setValue(toSelect);
    //this.selectedStatusOption_ = toSelect;

    this.selectedStatusOption_=toSelect;

    //this.form.get('exampleFormControlSelect1').setValue(toSelect);

    //alert(JSON.stringify(this.selectedStatusOption_));
  }

  onDelete(id: string) {
    if (confirm('Are you sure to delete this record ?') === true) {
      this.grantApiService.deleteGrant(id).subscribe((res) => {
        this.resetForm();
        this.refreshGrantList();
        //this.toastr.success('Successfully Deleted!');
      },
      err => {
        //this.toastr.error('Error!');
        console.log(err);
      });
    }
  }

  refreshGrantList() {    
    this.grantApiService.getGrantList().subscribe((res) => {
      if (res['grant']) {
        this.grantList = [];
          for (let i in res['grant']) {
            const data: Grant = {              
              id: res['grant'][i]['id'],
              grant_name: res['grant'][i]['grant_name'],
              grant_status: res['grant'][i]['grant_status'],
              grantor: res['grant'][i]['grantor'],
              grant_geo_location: res['grant'][i]['grant_geo_location'],
              grant_description: res['grant'][i]['grant_description'],
              grant_amount: res['grant'][i]['grant_amount'],
              grant_amount_currency: res['grant'][i]['grant_amount_currency']
            };
            this.grantList.push(data);
          }
          this.grantApiService.grants = this.grantList;           
      }
      /*if (this.grantApiService.grants.length === 0) {
        this.grantMessage = 'No grants added';
      } else {
        this.grantMessage = '';
      }*/
    },
    err => {
      //this.toastr.error('Error!');
      console.log(err);
    });
  }

  /**
   * Logout the user and revoke his token
   */
  logout(): void {
    this.loading = true;
    this.authService.logout()
      .subscribe(() => {
        this.loading = false;
        localStorage.removeItem('access_token');
        this.router.navigate(['/login']);
      });
  }

}
