<?php
class ProjectConverter
{
    private $projects;

    public function __construct(Array $proj)
    {
        $this->projects = $proj;
    }

    public function convert($name){
        reset($this->projects);
        $prev=$this->projects[count($this->projects)-1];
        foreach ($this->projects as $value) {
            if ($value['name']===$name){
                $actProject=$value;
                $actProject['prev']=$prev["name"];
                $n=current($this->projects);
                $actProject['next']=($n?$n["name"]:$this->projects[0]["name"]);
                $actProject['images']=$this->imageList($actProject['name']);
                return $actProject;
            }
            $prev=$value;
        }

        $actProject=$this->projects[0];
        $actProject['prev']=$this->projects[count($this->projects)-1]["name"];
        $actProject['next']=$this->projects[1]["name"];
        $actProject['images']=$this->imageList($actProject['name']);
        return $actProject;
    }

    private function imageList($name){
        // TODO : asset manager-es megoldas
        $list=[];
        $index="";
        if ($handle = opendir(getcwd().'/static/img/project/'.$name)) {
            while (false !== ($entry = readdir($handle))) {
                if ($entry==='.'|| $entry==='..' ){
                    continue;
                }
                if ('index'===pathinfo($entry)['filename']){
                    continue;
                }
                $list[]=$entry;
            }        
        }
        if (count($list)==0){
            return ['first'=>'../noimage.jpg','list'=>$list];
        }
        sort($list);
        $first=array_shift($list);
        return ['first'=>$first,'list'=>$list];
    }
}
?>