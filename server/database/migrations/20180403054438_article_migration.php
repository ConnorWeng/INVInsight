<?php

use think\migration\Migrator;
use think\migration\db\Column;

class ArticleMigration extends Migrator
{
    /**
     * Change Method.
     *
     * Write your reversible migrations using this method.
     *
     * More information on writing migrations is available here:
     * http://docs.phinx.org/en/latest/migrations.html#the-abstractmigration-class
     *
     * The following commands can be used in this method and Phinx will
     * automatically reverse them when rolling back:
     *
     *    createTable
     *    renameTable
     *    addColumn
     *    renameColumn
     *    addIndex
     *    addForeignKey
     *
     * Remember to call "create()" or "update()" and NOT "save()" when working
     * with the Table class.
     */
    // public function change()
    // {

    // }

    public function up()
    {
        $table= $this->table('articles');   
        $table->addColumn(Column::string('title')->setComment('标题'))
            ->addColumn(Column::text('content')->setComment('内容'))
            ->addColumn(Column::integer('category_id')->setComment('类目id'))
            ->addColumn(Column::integer('user_id')->setComment('用户id'))
            ->addTimestamps()
            ->addIndex(['title'],['unique'=>true])
            ->addForeignKey('category_id','category')
            ->addForeignKey('user_id','users')
            ->create();
    }

    public function down()
    {
        $this->dropTable('articles');
    }
}
