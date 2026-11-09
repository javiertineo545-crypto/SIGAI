<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // PERMISOS BASE
        $permissions = [
            // PERSONNEL
            ['name' => 'personnel.view', 'display_name' => 'Ver Personal'],
            ['name' => 'personnel.create', 'display_name' => 'Crear Personal'],
            ['name' => 'personnel.edit', 'display_name' => 'Editar Personal'],
            ['name' => 'personnel.toggle-status', 'display_name' => 'Activar o Desactivar Personal'],

            // USERS
            ['name' => 'users.view', 'display_name' => 'Ver Usuarios'],
            ['name' => 'users.create', 'display_name' => 'Crear Usuarios'],
            ['name' => 'users.edit', 'display_name' => 'Editar Usuarios'],
            ['name' => 'users.toggle-status', 'display_name' => 'Activar o Desactivar Usuarios'],

            // ROLES
            ['name' => 'roles.view', 'display_name' => 'Ver Roles'],
            ['name' => 'roles.create', 'display_name' => 'Crear Roles'],
            ['name' => 'roles.edit', 'display_name' => 'Editar Roles'],
            ['name' => 'roles.delete', 'display_name' => 'Eliminar Roles'],

            // POSITIONS
            ['name' => 'positions.view', 'display_name' => 'Ver Cargos'],
            ['name' => 'positions.create', 'display_name' => 'Crear Cargos'],
            ['name' => 'positions.edit', 'display_name' => 'Editar Cargos'],
            ['name' => 'positions.delete', 'display_name' => 'Eliminar Cargos'],
            ['name' => 'positions.toggle-status', 'display_name' => 'Activar o Desactivar Cargos'],

            // PERMISSIONS
            ['name' => 'permissions.view', 'display_name' => 'Ver Permisos'],
            ['name' => 'permissions.create', 'display_name' => 'Crear Permisos'],
            ['name' => 'permissions.edit', 'display_name' => 'Editar Permisos'],
            ['name' => 'permissions.delete', 'display_name' => 'Eliminar Permisos'],

            // -----------------------------------------------------------------------------------------------------------------------------

            [ 'name' => 'categorias.view', 'display_name' => 'Ver Categorías', ],
            [ 'name' => 'categorias.create', 'display_name' => 'Crear Categorías', ],
            [ 'name' => 'categorias.edit', 'display_name' => 'Editar Categorías', ],
            [ 'name' => 'categorias.delete', 'display_name' => 'Eliminar Categorías', ],
            [ 'name' => 'categorias.toggle-status', 'display_name' => 'Activar o Desactivar Categorías', ],

            [ 'name' => 'marcas.view', 'display_name' => 'Ver Marca', ],
            [ 'name' => 'marcas.create', 'display_name' => 'Crear Marca', ],
            [ 'name' => 'marcas.edit', 'display_name' => 'Editar Marca', ],
            [ 'name' => 'marcas.delete', 'display_name' => 'Borrar Marca', ],
            [ 'name' => 'marcas.toggle-status', 'display_name' => 'Activar o Desactivar Marca', ],

            [ 'name' => 'ubicaciones.view', 'display_name' => 'Ver Ubicaciones', ],
            [ 'name' => 'ubicaciones.create', 'display_name' => 'Crear Ubicaciones', ],
            [ 'name' => 'ubicaciones.edit', 'display_name' => 'Editar Ubicaciones', ],
            [ 'name' => 'ubicaciones.delete', 'display_name' => 'Eliminar Ubicaciones', ],
            [ 'name' => 'ubicaciones.toggle-status', 'display_name' => 'Activar o Desactivar Ubicaciones', ],

            [ 'name' => 'proveedores.view', 'display_name' => 'Ver Proveedores', ],
            [ 'name' => 'proveedores.create', 'display_name' => 'Crear Proveedores', ],
            [ 'name' => 'proveedores.edit', 'display_name' => 'Editar Proveedores', ],
            [ 'name' => 'proveedores.delete', 'display_name' => 'Eliminar Proveedores', ],
            [ 'name' => 'proveedores.toggle-status', 'display_name' => 'Activar o Desactivar Proveedores', ],

            [ 'name'=>'estados-articulo.view','display_name'=>'Ver Estados de Artículo', ],
            [ 'name'=>'estados-articulo.create','display_name'=>'Crear Estados de Artículo', ],
            [ 'name'=>'estados-articulo.edit','display_name'=>'Editar Estados de Artículo', ],
            [ 'name'=>'estados-articulo.delete','display_name'=>'Eliminar Estados de Artículo', ],

            [ 'name' => 'articulos.view', 'display_name' => 'Ver Artículos', ],
            [ 'name' => 'articulos.create', 'display_name' => 'Crear Artículos', ],
            [ 'name' => 'articulos.edit', 'display_name' => 'Editar Artículos', ],
            [ 'name' => 'articulos.delete', 'display_name' => 'Eliminar Artículos', ],

            [ 'name' => 'referencias.view', 'display_name' => 'Ver Referencias' ],
            [ 'name' => 'referencias.create', 'display_name' => 'Crear Referencias' ],
            [ 'name' => 'referencias.edit', 'display_name' => 'Editar Referencias' ],
            [ 'name' => 'referencias.delete', 'display_name' => 'Eliminar Referencias' ],

            [ 'name' => 'entradas.view', 'display_name' => 'Ver Entradas' ],
            [ 'name' => 'entradas.create', 'display_name' => 'Crear Entradas' ],
            [ 'name' => 'entradas.edit', 'display_name' => 'Editar Entradas' ],
            [ 'name' => 'entradas.edit-detalle', 'display_name' => 'Editar Unidades de Entradas' ],
            [ 'name' => 'entradas.delete', 'display_name' => 'Eliminar Entradas' ],

            // Permiso de salidas
            ['name' => 'salidas.view', 'display_name' => 'Ver Salidas'],
            ['name' => 'salidas.create', 'display_name' => 'Crear Salidas'],
            //['name' => 'salidas.delete', 'display_name' => 'Eliminar Salidas'],

        // Permisos de Asignaciones 
            ['name' => 'asignaciones.view', 'display_name' => 'Ver Asignaciones'],
            ['name' => 'asignaciones.create', 'display_name' => 'Crear Asignaciones'],
            ['name' => 'asignaciones.devolver', 'display_name' => 'Registrar Devoluciones'],

            [ 'name' => 'articulo-unidades.view', 'display_name' => 'Ver Unidades de Artículos', ],

            [ 'name' => 'reportes.view', 'display_name' => 'Ver Reportes', ],
            // [ 'name' => 'reportes.export', 'display_name' => 'Exportar Reportes', ],
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(
                ['name' => $permission['name']],
                [
                    'display_name' => $permission['display_name'],
                    'guard_name' => 'web',
                ]
            );
        }

        // ROLES
        $superAdmin = Role::firstOrCreate([
            'name' => 'Super Admin',
            'guard_name' => 'web',
        ]);

        // Super Admin tiene todo
        $superAdmin->syncPermissions(Permission::all());
    }
}