timing_test(function() {
  at(0, function() {
    assert_styles(
      '.anim',
      [{'left':'200px'},
       {'left':'100px'},
       {'left':'0px'},
       {'left':'200px'}]);
  }, "Autogenerated");
  at(0.4, function() {
    assert_styles(
      '.anim',
      [{'left':'180px'},
       {'left':'120px'},
       {'left':'60px'},
       {'left':'240px'}]);
  }, "Autogenerated");
  at(0.8, function() {
    assert_styles(
      '.anim',
      [{'left':'160px'},
       {'left':'140px'},
       {'left':'120px'},
       {'left':'280px'}]);
  }, "Autogenerated");
  at(1.2000000000000002, function() {
    assert_styles(
      '.anim',
      [{'left':'140px'},
       {'left':'160px'},
       {'left':'180px'},
       {'left':'320px'}]);
  }, "Autogenerated");
  at(1.6, function() {
    assert_styles(
      '.anim',
      [{'left':'120px'},
       {'left':'180px'},
       {'left':'240px'},
       {'left':'360px'}]);
  }, "Autogenerated");
  at(2, function() {
    assert_styles(
      '.anim',
      [{'left':'100px'},
       {'left':'200px'},
       {'left':'300px'},
       {'left':'400px'}]);
  }, "Autogenerated");
  at(2.4, function() {
    assert_styles(
      '.anim',
      [{'left':'100px'},
       {'left':'200px'},
       {'left':'300px'},
       {'left':'400px'}]);
  }, "Autogenerated");
}, "Autogenerated checks.");
