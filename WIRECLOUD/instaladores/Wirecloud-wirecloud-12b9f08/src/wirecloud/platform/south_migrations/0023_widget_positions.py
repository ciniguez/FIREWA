# -*- coding: utf-8 -*-
from south.v2 import DataMigration


class Migration(DataMigration):

    def forwards(self, orm):
        for widget in orm.IWidget.objects.all():
            icon_position = widget.icon_position
            if icon_position is not None:
                widget.positions['icon'] = {
                    'top': icon_position.posX if icon_position.posX >= 0 else 0,
                    'left': icon_position.posY if icon_position.posY >= 0 else 0,
                }

            position = widget.position
            widget.positions['widget'] = {
                'top': position.posX if position.posX >= 0 else 0,
                'left': position.posY if position.posY >= 0 else 0,
                'zIndex': position.posZ if position.posZ >= 0 else 0,
                'height': position.height if position.height > 0 else 1,
                'width': position.width if position.width > 0 else 1,
                'minimized': position.minimized,
                'fulldragboard': position.fulldragboard,
            }
            widget.save()

    def backwards(self, orm):
        raise RuntimeError("Cannot reverse this migration.")

    models = {
        u'auth.group': {
            'Meta': {'object_name': 'Group'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        u'auth.permission': {
            'Meta': {'ordering': "(u'content_type__app_label', u'content_type__model', u'codename')", 'unique_together': "((u'content_type', u'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['contenttypes.ContentType']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        u'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'related_name': "u'user_set'", 'blank': 'True', 'to': u"orm['auth.Group']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'related_name': "u'user_set'", 'blank': 'True', 'to': u"orm['auth.Permission']"}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        u'catalogue.catalogueresource': {
            'Meta': {'unique_together': "((u'short_name', u'vendor', u'version'),)", 'object_name': 'CatalogueResource'},
            'creation_date': ('django.db.models.fields.DateTimeField', [], {}),
            'creator': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "u'uploaded_resources'", 'null': 'True', 'to': u"orm['auth.User']"}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'related_name': "u'local_resources'", 'blank': 'True', 'to': u"orm['auth.Group']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'json_description': ('django.db.models.fields.TextField', [], {}),
            'popularity': ('django.db.models.fields.DecimalField', [], {'default': '0', 'max_digits': '2', 'decimal_places': '1'}),
            'public': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'short_name': ('django.db.models.fields.CharField', [], {'max_length': '250'}),
            'template_uri': ('django.db.models.fields.CharField', [], {'max_length': '200', 'blank': 'True'}),
            'type': ('django.db.models.fields.SmallIntegerField', [], {}),
            'users': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'related_name': "u'local_resources'", 'blank': 'True', 'to': u"orm['auth.User']"}),
            'vendor': ('django.db.models.fields.CharField', [], {'max_length': '250'}),
            'version': ('django.db.models.fields.CharField', [], {'max_length': '150'})
        },
        u'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'platform.constant': {
            'Meta': {'object_name': 'Constant', 'db_table': "'wirecloud_constant'"},
            'concept': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '255'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'value': ('django.db.models.fields.CharField', [], {'max_length': '256'})
        },
        'platform.iwidget': {
            'Meta': {'object_name': 'IWidget', 'db_table': "'wirecloud_iwidget'"},
            'icon_position': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'Icon_Position'", 'null': 'True', 'to': "orm['platform.Position']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'layout': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '250'}),
            'position': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'Position'", 'null': 'True', 'to': "orm['platform.Position']"}),
            'positions': ('wirecloud.commons.fields.JSONField', [], {'default': "'{}'", 'blank': 'True'}),
            'readOnly': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'refused_version': ('django.db.models.fields.CharField', [], {'max_length': '150', 'null': 'True', 'blank': 'True'}),
            'tab': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['platform.Tab']"}),
            'variables': ('wirecloud.commons.fields.JSONField', [], {'default': "'{}'", 'blank': 'True'}),
            'widget': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['platform.Widget']"})
        },
        'platform.market': {
            'Meta': {'unique_together': "(('user', 'name'),)", 'object_name': 'Market', 'db_table': "'wirecloud_market'"},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'options': ('django.db.models.fields.TextField', [], {}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']", 'null': 'True', 'blank': 'True'})
        },
        'platform.marketuserdata': {
            'Meta': {'unique_together': "(('market', 'user', 'name'),)", 'object_name': 'MarketUserData', 'db_table': "'wirecloud_marketuserdata'"},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'market': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['platform.Market']"}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']"}),
            'value': ('django.db.models.fields.CharField', [], {'max_length': '250'})
        },
        'platform.platformpreference': {
            'Meta': {'object_name': 'PlatformPreference', 'db_table': "'wirecloud_platformpreference'"},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '250'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']"}),
            'value': ('django.db.models.fields.CharField', [], {'max_length': '250'})
        },
        'platform.position': {
            'Meta': {'object_name': 'Position', 'db_table': "'wirecloud_position'"},
            'fulldragboard': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'height': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'minimized': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'posX': ('django.db.models.fields.IntegerField', [], {}),
            'posY': ('django.db.models.fields.IntegerField', [], {}),
            'posZ': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'width': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'})
        },
        u'platform.tab': {
            'Meta': {'unique_together': "((u'name', u'workspace'),)", 'object_name': 'Tab', 'db_table': "u'wirecloud_tab'"},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '30'}),
            'position': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'visible': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'workspace': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['platform.Workspace']"})
        },
        'platform.tabpreference': {
            'Meta': {'object_name': 'TabPreference', 'db_table': "'wirecloud_tabpreference'"},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'inherit': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '250'}),
            'tab': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['platform.Tab']"}),
            'value': ('django.db.models.fields.CharField', [], {'max_length': '250'})
        },
        u'platform.userworkspace': {
            'Meta': {'object_name': 'UserWorkspace', 'db_table': "u'wirecloud_userworkspace'"},
            'active': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'manager': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'reason_ref': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']"}),
            'workspace': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['platform.Workspace']"})
        },
        u'platform.widget': {
            'Meta': {'ordering': "(u'resource__vendor', u'resource__short_name', u'resource__version')", 'object_name': 'Widget', 'db_table': "u'wirecloud_widget'"},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'resource': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['catalogue.CatalogueResource']", 'unique': 'True'}),
            'xhtml': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['platform.XHTML']"})
        },
        u'platform.workspace': {
            'Meta': {'unique_together': "((u'creator', u'name'),)", 'object_name': 'Workspace', 'db_table': "u'wirecloud_workspace'"},
            'creation_date': ('django.db.models.fields.BigIntegerField', [], {'default': '1436861419301.012'}),
            'creator': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "u'creator'", 'to': u"orm['auth.User']"}),
            'description': ('django.db.models.fields.TextField', [], {'max_length': '140', 'blank': 'True'}),
            'forcedValues': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': u"orm['auth.Group']", 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_modified': ('django.db.models.fields.BigIntegerField', [], {'null': 'True', 'blank': 'True'}),
            'longdescription': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '30'}),
            'public': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'users': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.User']", 'through': u"orm['platform.UserWorkspace']", 'symmetrical': 'False'}),
            'wiringStatus': ('django.db.models.fields.TextField', [], {'blank': 'True'})
        },
        'platform.workspacepreference': {
            'Meta': {'object_name': 'WorkspacePreference', 'db_table': "'wirecloud_workspacepreference'"},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'inherit': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '250'}),
            'value': ('django.db.models.fields.CharField', [], {'max_length': '250'}),
            'workspace': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['platform.Workspace']"})
        },
        u'platform.xhtml': {
            'Meta': {'object_name': 'XHTML', 'db_table': "u'wirecloud_xhtml'"},
            'cacheable': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'code': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'code_timestamp': ('django.db.models.fields.BigIntegerField', [], {'null': 'True', 'blank': 'True'}),
            'content_type': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'uri': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '255'}),
            'url': ('django.db.models.fields.CharField', [], {'max_length': '500'}),
            'use_platform_style': ('django.db.models.fields.BooleanField', [], {'default': 'False'})
        }
    }

    complete_apps = ['platform']
    symmetrical = True
