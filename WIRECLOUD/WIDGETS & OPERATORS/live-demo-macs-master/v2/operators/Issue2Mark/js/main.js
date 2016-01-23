/*
 *     Copyright (c) 2013 CoNWeT Lab., Universidad Politécnica de Madrid
 *
 *     This file is part of the issue2mark operator.
 *
 *     issue2mark is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or (at
 *     your option) any later version.
 *
 *     issue2mark is distributed in the hope that it will be useful, but
 *     WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero
 *     General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with issue2mark. If not, see <http://www.gnu.org/licenses/>.
 *
 *     Linking this library statically or dynamically with other modules is
 *     making a combined work based on this library.  Thus, the terms and
 *     conditions of the GNU Affero General Public License cover the whole
 *     combination.
 *
 *     As a special exception, the copyright holders of this library give you
 *     permission to link this library with independent modules to produce an
 *     executable, regardless of the license terms of these independent
 *     modules, and to copy and distribute the resulting executable under
 *     terms of your choice, provided that you also meet, for each linked
 *     independent module, the terms and conditions of the license of that
 *     module.  An independent module is a module which is not derived from
 *     or based on this library.  If you modify this library, you may extend
 *     this exception to your version of the library, but you are not
 *     obligated to do so.  If you do not wish to do so, delete this
 *     exception statement from your version.
 *
 */

/*global MashupPlatform*/

(function () {

    "use strict";

    MashupPlatform.wiring.registerCallback("issueInput", function (issueString) {
        var issue = JSON.parse(issueString);
        if (issue) {
            var content = "<div>";
            if (issue.imageURL) {
                content += '<img src="' + issue.imageURL + '" style="width:100px" />';
            }
            content += issue.id + '<br/>';
            content += issue.severity;
            content += "</div>";
            var mark = {
                'id' : issue.id,
                'start': issue.creationDate,
                'content': content,
                'data': issue
            };
            if (issue.closingDate) {
                mark.end = issue.closingDate;
            }
            MashupPlatform.wiring.pushEvent("markOutput", JSON.stringify(mark));
        }
    });

})();
