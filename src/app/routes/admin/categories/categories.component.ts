import { Component, OnInit, ElementRef } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { Http, Headers, Response, RequestOptions  } from '@angular/http';
import { Observable  } from 'rxjs/Observable';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationsService } from 'angular2-notifications';

import { Category } from '../../../shared/objectSchema';

import { TreeNode, TreeModel, TREE_ACTIONS, KEYS, IActionMapping, ITreeOptions } from 'angular-tree-component';

const actionMapping:IActionMapping = {
  mouse: {
    dblClick: (tree, node, $event) => {
      if (node.hasChildren) TREE_ACTIONS.TOGGLE_EXPANDED(tree, node, $event);
    }
  },
};

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})

export class CategoriesComponent implements OnInit {

  categories: Array<object>;
  isAdd: true;
  newCategory: Category = {
    uuid			: '',
  	Title			: '',
  	Desc			: '',
    created_time: null,
  	hasChildren	: false,
  	expanded		: true,
  	Questions 	: []
  };


  customTreeOptions: ITreeOptions = {
    // displayField: 'subTitle',
    isExpandedField: 'expanded',
    idField: 'uuid',
    actionMapping,
    nodeHeight: 23,
    allowDrag: (node) => {
      // console.log('allowDrag?');
      return true;
    },
    allowDrop: (node) => {
      // console.log('allowDrop?');
      return true;
    },
    animateExpand: true,
    animateSpeed: 10,
    animateAcceleration: 1.2
  }

  constructor(
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute,
    private _notificationService: NotificationsService
  ) {
  }

  moveup(node, tree, event){
    let parentNode = node.parent.data.children;
    let index = parentNode.findIndex(function(item){
      return item.uuid == node.data.uuid;
    })
    if(parentNode[index-1])
    {
      let tmp = parentNode[index-1];
      parentNode[index-1] = parentNode[index];
      parentNode[index] = tmp;
      tree.treeModel.update();
    }
  }
  movedown(node, tree, event){
    let parentNode = node.parent.data.children;
    let index = parentNode.findIndex(function(item){
      return item.uuid == node.data.uuid;
    })
    if(parentNode[index+1])
    {
      let tmp = parentNode[index+1];
      parentNode[index+1] = parentNode[index];
      parentNode[index] = tmp;
      tree.treeModel.update();
    }
  }
  openEditCatModal(modal, node){
    this.newCategory = new Category;
    this.newCategory.uuid = node.data.uuid;
    this.newCategory.Title = node.data.Title;
    this.newCategory.Desc = node.data.Desc;
    modal.open();
  }

  editCategory(modal,tree){
    let uuid = this.newCategory.uuid;
    let node = tree.treeModel.getNodeById(uuid);
    node.data.Title = this.newCategory.Title;
    node.data.Desc = this.newCategory.Desc;
    tree.treeModel.update();
    modal.close()
  }
  openNewCatModal(modal){
    this.newCategory = new Category();
    this.newCategory.uuid = "";
    this.newCategory.Title = "";
    this.newCategory.Desc = "";
    this.newCategory.created_time = new Date();
    this.newCategory.hasChildren = false;
    this.newCategory.expanded = true;
    this.newCategory.Questions = [];
    modal.open();
  }

  addNewCategory(modal,tree){
    let uuid = this.dataService.getUUID();
    this.newCategory.uuid = uuid;
    this.categories.push(this.newCategory);
    tree.treeModel.update();
    modal.close()
  }

  removeCategory(node, tree){
    if(confirm("Are you really want to remove this Category?"))
    {
      let parentNode = node.parent.data;
      let index = parentNode.children.findIndex(function(element){
        return element.uuid == node.data.uuid;
      });

      parentNode.children.splice(index,1);
      tree.treeModel.update();
    }
  }

  saveCategory(){
    let data = {
      categories: this.categories
    }
    this.dataService.saveAsssessment(data).subscribe(
      response => {
        if(response.ERR_CODE == 'ERR_NONE')
        {
          this.dataService.onCategoryChanged();
          this._notificationService.success(
              'Successfully Saved!',
              'Category'
          )
        }else{
          this._notificationService.error(
              'Sth went wrong',
              'Category'
          )
        }
      },
      (error) => {
        this._notificationService.error(
            'Sth went wrong',
            'Category'
        )
      }
    );
  }

  ngOnInit() {
    let projectID = 'all';
    this.dataService.getAssessmentList(projectID).subscribe(
      response => {
        this.categories = response.Categories;
      },
      (error) => {

      }
    );
  }
}
